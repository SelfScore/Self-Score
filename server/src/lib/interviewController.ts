import {
  InterviewSession,
  InterviewAction,
  GeminiInstruction,
} from "../types/realtimeInterview.types";
import { InterviewStateMachine } from "./interviewStateMachine";
import sessionRegistry from "../services/sessionManager";
import answerAnalyzer from "../services/answerAnalyzer";
import geminiRealtimeService from "../services/geminiRealtimeService";

/**
 * InterviewController - Decision engine that orchestrates interview flow
 * Decides when to move forward, ask follow-ups, or redirect
 */
export class InterviewController {
  private stateMachine: InterviewStateMachine;
  private session: InterviewSession;

  constructor(session: InterviewSession) {
    this.session = session;
    this.stateMachine = new InterviewStateMachine(session);
  }

  /**
   * Handle silence detected - main decision point
   */
  async handleSilence(): Promise<void> {
    console.log("\n" + "=".repeat(70));
    console.log("🔇 SILENCE DETECTED - Starting analysis...");
    console.log("=".repeat(70));

    // Wait for any pending analysis to complete
    if (this.session.pendingAnalysis) {
      console.log("⏳ Waiting for pending analysis to complete...");
      await this.session.pendingAnalysis;
    }

    const currentQuestion = this.stateMachine.currentQuestion();
    if (!currentQuestion) {
      console.log("✅ No current question - interview complete");
      return;
    }

    const answerState = this.session.answers.get(currentQuestion.questionId);
    if (!answerState) {
      console.log("⚠️ No answer state found for current question");
      return;
    }

    const currentTranscript = answerState.transcript.trim();

    // Check if we have any content
    if (currentTranscript.length < 10) {
      console.log(
        "⏳ Transcript too short (<10 chars), waiting for more input...",
      );
      return;
    }

    console.log(
      `📝 Analyzing transcript (${
        currentTranscript.length
      } chars): "${currentTranscript.substring(0, 100)}..."`,
    );

    // Send "processing" indicator to frontend immediately
    this.sendProcessingIndicator();

    // Pre-warm Gemini connection while analysis runs (reduces latency)
    if (this.session.geminiConnection) {
      geminiRealtimeService.prepareForResponse(this.session.geminiConnection);
    }

    // Run answer analysis
    console.log("\n🔍 Running Gemini Flash analysis...");
    const analysisPromise = answerAnalyzer.analyzeAnswer(
      currentQuestion.questionText,
      currentTranscript,
      this.session.currentQuestionIndex,
    );
    this.session.pendingAnalysis = analysisPromise;

    try {
      const analysis = await analysisPromise;
      console.log(`\n📊 Analysis complete:`, {
        confidence: analysis.confidence,
        isComplete: analysis.isComplete,
        isOffTopic: analysis.isOffTopic,
        hasFollowUp: analysis.suggestedFollowUp.length > 0,
      });

      // Update state with analysis
      this.stateMachine.updateAnswerAnalysis(analysis);

      // Track conversation history
      const answerState = this.stateMachine.getCurrentAnswerState();
      if (answerState && answerState.conversationHistory) {
        // Find the last turn to determine what we're responding to
        const lastTurn =
          answerState.conversationHistory[
            answerState.conversationHistory.length - 1
          ];

        if (!lastTurn) {
          // No turns yet, this is the main answer
          this.stateMachine.addMainAnswer(
            currentTranscript,
            analysis.confidence,
          );
        } else if (
          lastTurn.type === "follow_up_question" ||
          lastTurn.type === "redirect"
        ) {
          // We're responding to a follow-up or redirect
          this.stateMachine.addFollowUpAnswer(
            currentTranscript,
            analysis.confidence,
          );
        } else if (
          lastTurn.type === "main_answer" ||
          lastTurn.type === "follow_up_answer"
        ) {
          // User is continuing to speak, update the existing answer
          if (lastTurn.type === "main_answer") {
            this.stateMachine.addMainAnswer(
              currentTranscript,
              analysis.confidence,
            );
          } else {
            this.stateMachine.addFollowUpAnswer(
              currentTranscript,
              analysis.confidence,
            );
          }
        }
      }

      // Decide next action
      console.log("\n🎯 CALLING DECISION ENGINE...");
      const action = this.stateMachine.decideNextAction();

      console.log("\n" + "-".repeat(60));
      console.log(`🎯 DECISION: ${action}`);
      console.log("-".repeat(60) + "\n");

      await this.executeAction(action);
    } catch (error) {
      console.error("❌ Analysis failed:", error);

      // On error, show error message and move to next question
      this.sendErrorMessage(
        "Failed to analyze your response. Moving to next question.",
      );
      await this.executeAction(InterviewAction.NEXT_QUESTION);
    } finally {
      this.session.pendingAnalysis = null;
    }
  }

  /**
   * Execute the decided action
   */
  private async executeAction(action: InterviewAction): Promise<void> {
    switch (action) {
      case InterviewAction.NEXT_QUESTION:
        await this.moveToNextQuestion();
        break;

      case InterviewAction.FOLLOW_UP:
        await this.askFollowUp();
        break;

      case InterviewAction.REDIRECT:
        await this.redirectUser();
        break;

      case InterviewAction.END_INTERVIEW:
        await this.endInterview();
        break;

      case InterviewAction.CONTINUE:
        console.log("⏳ Continue listening...");
        break;
    }
  }

  /**
   * Move to next question
   */
  private async moveToNextQuestion(): Promise<void> {
    console.log("➡️  Moving to next question...");

    // Mark current question complete
    this.stateMachine.completeCurrentQuestion();

    // CHANGE 3 & 4: Save current answer to database immediately
    await this.saveCurrentAnswerToDB();

    // Get next question
    const nextQuestion = this.stateMachine.nextQuestion();

    if (!nextQuestion) {
      console.log("✅ All questions complete!");
      await this.endInterview();

      // Notify client that interview is complete
      if (this.session.wsConnection) {
        this.sendWebSocketMessage({
          type: "interview_complete",
          message: "All questions completed",
        });
      }
      return;
    }

    console.log(
      `📋 Next question (${this.session.currentQuestionIndex + 1}/${
        this.session.questions.length
      }): ${nextQuestion.questionText}`,
    );

    // Send instruction to Gemini to ask next question FIRST
    const instruction: GeminiInstruction = {
      type: "ask_question",
      content: nextQuestion.questionText,
    };

    // Notify client of next question FIRST (so it displays when AI starts speaking)
    if (this.session.wsConnection) {
      this.sendWebSocketMessage({
        type: "next_question",
        questionNumber: this.session.currentQuestionIndex + 1,
        questionText: nextQuestion.questionText,
      });

      // Send progress update
      const progress = this.getProgress();
      this.sendWebSocketMessage({
        type: "progress",
        currentQuestion: progress.current,
        totalQuestions: progress.total,
      });
    }

    console.log(
      `🎙️ Sending instruction to Gemini to ask question ${
        this.session.currentQuestionIndex + 1
      }`,
    );
    await this.sendInstructionToGemini(instruction);
  }

  /**
   * Ask follow-up question
   */
  private async askFollowUp(): Promise<void> {
    console.log("🔄 Asking follow-up question...");

    const currentQuestion = this.stateMachine.currentQuestion();
    const answerState = this.stateMachine.getCurrentAnswerState();

    if (!currentQuestion || !answerState) return;

    // Mark that follow-up was asked
    this.stateMachine.markFollowUpAsked();

    // Use the AI-generated follow-up from analysis
    const followUpQuestion =
      answerState.suggestedFollowUp ||
      `Could you elaborate more on ${answerState.missingAspects.join(", ")}?`;

    console.log(
      `🔄 Asking follow-up ${answerState.followUpCount}/3: ${followUpQuestion}`,
    );

    // Add follow-up question to conversation history
    this.stateMachine.addFollowUpQuestion(followUpQuestion);

    // Send to frontend
    if (this.session.wsConnection) {
      this.sendWebSocketMessage({
        type: "follow_up",
        questionText: followUpQuestion,
        followUpCount: answerState.followUpCount,
      });
    }

    // Send instruction to Gemini with context
    const instruction: GeminiInstruction = {
      type: "follow_up",
      content: followUpQuestion,
      context: `User's answer lacked: ${answerState.missingAspects.join(", ")}`,
      missingAspects: answerState.missingAspects,
    };

    await this.sendInstructionToGemini(instruction);
  }

  /**
   * Redirect user back to topic
   */
  private async redirectUser(): Promise<void> {
    console.log("🔀 Redirecting user back to topic...");

    const currentQuestion = this.stateMachine.currentQuestion();
    const answerState = this.stateMachine.getCurrentAnswerState();

    if (!currentQuestion || !answerState) return;

    // Mark that we gave a redirect
    this.stateMachine.markRedirectGiven();

    // Generate redirect message
    const redirect = await geminiRealtimeService.generateRedirect(
      currentQuestion.questionText,
      answerState.transcript,
    );

    // Add redirect to conversation history
    this.stateMachine.addRedirect(redirect);

    const instruction: GeminiInstruction = {
      type: "redirect",
      content: redirect,
    };

    await this.sendInstructionToGemini(instruction);
  }

  /**
   * End interview
   */
  private async endInterview(): Promise<void> {
    console.log("🏁 Ending interview...");

    const instruction: GeminiInstruction = {
      type: "close_interview",
      content:
        "Thank you so much for sharing your thoughts with me today. Your openness and honesty are truly valuable. This concludes our interview.",
    };

    await this.sendInstructionToGemini(instruction);

    // Will trigger final save in the controller
  }

  /**
   * Send "processing" indicator to frontend
   */
  private sendProcessingIndicator(): void {
    if (this.session.wsConnection) {
      this.sendWebSocketMessage({
        type: "ai_processing",
        message: "Analyzing your response...",
      });
      console.log("💭 Sent processing indicator to frontend");
    }
  }

  /**
   * Send error message to frontend
   */
  private sendErrorMessage(message: string): void {
    if (this.session.wsConnection) {
      this.sendWebSocketMessage({
        type: "error",
        message,
      });
      console.log(`❌ Sent error message: ${message}`);
    }
  }

  /**
   * Send instruction to Gemini
   */
  private async sendInstructionToGemini(
    instruction: GeminiInstruction,
  ): Promise<void> {
    if (!this.session.geminiConnection) {
      console.error("❌ No Gemini connection available in session");
      return;
    }

    const ws = this.session.geminiConnection;
    console.log(
      `🔍 Checking Gemini connection before sending ${instruction.type}...`,
    );
    console.log(`   Connection exists: ${!!ws}`);
    console.log(
      `   ReadyState: ${ws.readyState} (1=OPEN, 0=CONNECTING, 2=CLOSING, 3=CLOSED)`,
    );

    // If connection is closed or closing, attempt to reconnect
    if (ws.readyState !== 1) {
      // Not OPEN
      console.warn(
        `⚠️  Gemini connection not open. Attempting to reconnect...`,
      );

      // Try to recreate connection
      try {
        const newConnection =
          await geminiRealtimeService.createRealtimeConnection(
            this.session,
            (audioData: Buffer) => {
              // Send AI audio to frontend
              if (this.session.wsConnection?.readyState === 1) {
                this.session.wsConnection.send(audioData);
              }
            },
            (error: any) => {
              console.error("❌ Gemini reconnection error:", error);
            },
          );

        this.session.geminiConnection = newConnection;

        // Wait for connection to establish
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log(`✅ Gemini reconnected successfully`);
      } catch (error) {
        console.error("❌ Failed to reconnect to Gemini:", error);
        return;
      }
    }

    await geminiRealtimeService.sendInstruction(
      this.session.geminiConnection,
      instruction,
    );
  }

  /**
   * Send WebSocket message to client
   */
  private sendWebSocketMessage(message: any): void {
    try {
      if (
        this.session.wsConnection &&
        this.session.wsConnection.readyState === 1
      ) {
        this.session.wsConnection.send(JSON.stringify(message));
      }
    } catch (error) {
      console.error("❌ Error sending WebSocket message:", error);
    }
  }

  /**
   * Handle new transcript chunk
   */
  handleTranscript(transcript: string, isFinal: boolean): void {
    if (isFinal && transcript.length > 0) {
      console.log(`📝 Final transcript received: ${transcript}`);
      this.stateMachine.appendTranscript(transcript);

      // Clear the buffer
      this.stateMachine.clearCurrentTranscript();
    } else if (transcript.length > 0) {
      // Interim result - just log
      console.log(`📝 Interim: ${transcript.substring(0, 50)}...`);
    }
  }

  /**
   * Get current progress
   */
  getProgress() {
    return this.stateMachine.getProgress();
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.stateMachine.getStatistics();
  }

  /**
   * Save current answer to database (incremental sync)
   */
  private async saveCurrentAnswerToDB(): Promise<void> {
    try {
      const RealtimeInterviewModel =
        require("../models/realtimeInterview").default;
      const interview = await RealtimeInterviewModel.findById(
        this.session.interviewId,
      );

      if (!interview) {
        console.error("❌ Interview not found in database");
        return;
      }

      // Get all current answers
      const allAnswers = this.stateMachine.getAllAnswers();
      const statistics = this.stateMachine.getStatistics();

      // Debug: Log what we're getting from state machine
      console.log(
        `📊 DEBUG: allAnswers from state machine: ${allAnswers.length} answers`,
      );
      allAnswers.forEach((a, i) => {
        console.log(
          `   Answer ${i + 1}: questionId=${a.questionId}, transcript="${a.transcript.substring(0, 50)}...", isComplete=${a.isComplete}`,
        );
      });

      // Filter out empty transcripts and update database
      const filteredAnswers = allAnswers.filter(
        (answer) => answer.transcript && answer.transcript.trim().length > 0,
      );

      console.log(
        `📊 DEBUG: After filtering empty transcripts: ${filteredAnswers.length} answers`,
      );

      interview.answers = filteredAnswers.map((answer) => ({
        questionId: answer.questionId,
        transcript: answer.transcript,
        confidence: answer.confidence,
        isComplete: answer.isComplete,
        isOffTopic: answer.isOffTopic,
        missingAspects: answer.missingAspects,
        followUpAsked: answer.followUpAsked,
        followUpCount: answer.followUpCount,
        audioTimestamp: {
          start: new Date(answer.audioStartTime),
          end: new Date(Date.now()),
        },
      }));

      interview.interviewMetadata = statistics;
      await interview.save();

      console.log(
        `💾 Saved answer to DB - Interview: ${this.session.interviewId} - Total answers: ${interview.answers.length}/${this.session.questions.length}`,
      );
    } catch (error) {
      console.error("❌ Error saving answer to database:", error);
      // Don't throw - we don't want to interrupt the interview
    }
  }
}
