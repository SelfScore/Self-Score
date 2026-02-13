import {
  InterviewSession,
  Question,
  AnswerState,
  AnalysisResult,
  InterviewAction,
  ConversationTurn,
} from "../types/realtimeInterview.types";

/**
 * InterviewStateMachine - Manages interview progression and state
 */
export class InterviewStateMachine {
  private session: InterviewSession;

  constructor(session: InterviewSession) {
    this.session = session;
  }

  /**
   * Get current question
   */
  currentQuestion(): Question | null {
    if (this.session.currentQuestionIndex >= this.session.questions.length) {
      return null;
    }
    return this.session.questions[this.session.currentQuestionIndex];
  }

  /**
   * Get next question without advancing
   */
  peekNextQuestion(): Question | null {
    const nextIndex = this.session.currentQuestionIndex + 1;
    if (nextIndex >= this.session.questions.length) {
      return null;
    }
    return this.session.questions[nextIndex];
  }

  /**
   * Move to next question
   */
  nextQuestion(): Question | null {
    this.session.currentQuestionIndex++;

    if (this.session.currentQuestionIndex >= this.session.questions.length) {
      console.log(
        `✅ Interview completed - all ${this.session.questions.length} questions answered`,
      );
      return null;
    }

    const nextQuestion = this.currentQuestion();
    console.log(
      `➡️  Moving to question ${this.session.currentQuestionIndex + 1}/${
        this.session.questions.length
      }`,
    );

    // Initialize answer state for new question
    if (nextQuestion) {
      this.initializeAnswerState(nextQuestion.questionId);
    }

    return nextQuestion;
  }

  /**
   * Initialize answer state for a question (public now)
   */
  initializeAnswerState(questionId: string): void {
    if (!this.session.answers.has(questionId)) {
      const answerState: AnswerState = {
        questionId,
        transcript: "",
        conversationHistory: [], // Initialize conversation history
        confidence: 0,
        isComplete: false,
        isOffTopic: false,
        missingAspects: [],
        suggestedFollowUp: "",
        followUpAsked: false,
        followUpCount: 0, // Initialize follow-up counter
        redirectCount: 0, // Initialize redirect counter
        audioStartTime: Date.now(),
      };
      this.session.answers.set(questionId, answerState);
      console.log(`✅ Initialized answer state for question: ${questionId}`);
    }
  }

  /**
   * Append transcript to current answer
   */
  appendTranscript(transcript: string): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState) {
      // Append with space if there's existing content
      answerState.transcript = answerState.transcript
        ? `${answerState.transcript} ${transcript}`.trim()
        : transcript.trim();

      console.log(
        `📝 Transcript updated for question ${currentQ.order}: ${answerState.transcript.length} chars`,
      );
    }
  }

  /**
   * Add or update main answer in conversation history
   */
  addMainAnswer(answer: string, confidence: number): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState && answerState.conversationHistory) {
      // Check if main_answer already exists
      const existingMainAnswer = answerState.conversationHistory.find(
        (turn) => turn.type === "main_answer",
      );

      if (existingMainAnswer) {
        // Update existing turn
        existingMainAnswer.content = answer;
        existingMainAnswer.confidence = confidence;
        existingMainAnswer.timestamp = Date.now();
        console.log(`✅ Updated main answer in conversation history`);
      } else {
        // Add new turn
        const turn: ConversationTurn = {
          type: "main_answer",
          content: answer,
          timestamp: Date.now(),
          confidence,
        };
        answerState.conversationHistory.push(turn);
        console.log(`✅ Added main answer to conversation history`);
      }
    }
  }

  /**
   * Add follow-up question to conversation history
   */
  addFollowUpQuestion(question: string): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState && answerState.conversationHistory) {
      const turn: ConversationTurn = {
        type: "follow_up_question",
        content: question,
        timestamp: Date.now(),
      };
      answerState.conversationHistory.push(turn);
      console.log(`✅ Added follow-up question to conversation history`);
    }
  }

  /**
   * Add or update follow-up answer in conversation history
   */
  addFollowUpAnswer(answer: string, confidence: number): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState && answerState.conversationHistory) {
      // Find the last follow-up question to see if we already have an answer for it
      const lastFollowUpQuestionIndex = answerState.conversationHistory
        .map((turn, idx) => ({ turn, idx }))
        .reverse()
        .find((item) => item.turn.type === "follow_up_question")?.idx;

      if (lastFollowUpQuestionIndex !== undefined) {
        // Check if there's already an answer after this question
        const existingAnswer =
          answerState.conversationHistory[lastFollowUpQuestionIndex + 1];

        if (existingAnswer && existingAnswer.type === "follow_up_answer") {
          // Update existing answer
          existingAnswer.content = answer;
          existingAnswer.confidence = confidence;
          existingAnswer.timestamp = Date.now();
          console.log(`✅ Updated follow-up answer in conversation history`);
        } else {
          // Add new follow-up answer after the question
          const turn: ConversationTurn = {
            type: "follow_up_answer",
            content: answer,
            timestamp: Date.now(),
            confidence,
          };
          answerState.conversationHistory.push(turn);
          console.log(`✅ Added follow-up answer to conversation history`);
        }
      }
    }
  }

  /**
   * Add redirect to conversation history
   */
  addRedirect(redirect: string): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState && answerState.conversationHistory) {
      const turn: ConversationTurn = {
        type: "redirect",
        content: redirect,
        timestamp: Date.now(),
      };
      answerState.conversationHistory.push(turn);
      console.log(`✅ Added redirect to conversation history`);
    }
  }

  /**
   * Update answer with analysis results
   */
  updateAnswerAnalysis(analysis: AnalysisResult): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState) {
      answerState.confidence = analysis.confidence;
      answerState.isComplete = analysis.isComplete;
      answerState.isOffTopic = analysis.isOffTopic;
      answerState.missingAspects = analysis.missingAspects;
      answerState.suggestedFollowUp = analysis.suggestedFollowUp;

      console.log(
        `📊 Answer analysis updated - Confidence: ${
          analysis.confidence
        }%, Complete: ${analysis.isComplete}, Has follow-up: ${
          analysis.suggestedFollowUp.length > 0
        }`,
      );
    }
  }

  /**
   * Mark that follow-up was asked for current question
   */
  markFollowUpAsked(): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState) {
      answerState.followUpCount++;
      answerState.followUpAsked = true; // Keep for compatibility
      console.log(`\n🔄 MARKING FOLLOW-UP ASKED:`);
      console.log(`   Question: ${currentQ.order}`);
      console.log(`   Follow-up count: ${answerState.followUpCount}/3`);
    } else {
      console.log(
        `⚠️  WARNING: No answer state found for question ${currentQ.order}`,
      );
    }
  }

  /**
   * Mark that redirect was given for current question
   */
  markRedirectGiven(): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState) {
      answerState.redirectCount = (answerState.redirectCount || 0) + 1;
      console.log(`\n🔀 MARKING REDIRECT GIVEN:`);
      console.log(`   Question: ${currentQ.order}`);
      console.log(`   Redirect count: ${answerState.redirectCount}/2`);
    }
  }

  /**
   * Mark current question as complete
   */
  completeCurrentQuestion(): void {
    const currentQ = this.currentQuestion();
    if (!currentQ) return;

    const answerState = this.session.answers.get(currentQ.questionId);
    if (answerState) {
      answerState.isComplete = true;
      console.log(`✅ Question ${currentQ.order} marked complete`);
    }
  }

  /**
   * Get current answer state
   */
  getCurrentAnswerState(): AnswerState | null {
    const currentQ = this.currentQuestion();
    if (!currentQ) return null;

    return this.session.answers.get(currentQ.questionId) || null;
  }

  /**
   * Get all answers (for final submission)
   */
  getAllAnswers(): AnswerState[] {
    return Array.from(this.session.answers.values());
  }

  /**
   * Get progress information
   */
  getProgress(): {
    current: number;
    total: number;
    percentage: number;
    answeredCount: number;
  } {
    const answeredCount = Array.from(this.session.answers.values()).filter(
      (a) => a.isComplete,
    ).length;

    return {
      current: this.session.currentQuestionIndex + 1,
      total: this.session.questions.length,
      percentage: Math.round(
        ((this.session.currentQuestionIndex + 1) /
          this.session.questions.length) *
          100,
      ),
      answeredCount,
    };
  }

  /**
   * Check if interview is complete
   */
  isInterviewComplete(): boolean {
    return this.session.currentQuestionIndex >= this.session.questions.length;
  }

  /**
   * Get interview duration in seconds
   */
  getInterviewDuration(): number {
    return Math.floor((Date.now() - this.session.startTime) / 1000);
  }

  /**
   * Get current transcript (accumulated for current question)
   */
  getCurrentTranscript(): string {
    const currentQ = this.currentQuestion();
    if (!currentQ) return "";

    const answerState = this.session.answers.get(currentQ.questionId);
    return answerState?.transcript || "";
  }

  /**
   * Clear current transcript (used for buffering)
   */
  clearCurrentTranscript(): void {
    this.session.currentTranscript = "";
  }

  /**
   * Check if current answer needs follow-up
   */
  needsFollowUp(): boolean {
    const answerState = this.getCurrentAnswerState();
    if (!answerState) return false;

    // Check if we've exhausted follow-up attempts (max 3)
    if (answerState.followUpCount >= 3) {
      return false;
    }

    // Need follow-up if confidence is low and has some content
    return (
      answerState.confidence < 60 && answerState.transcript.length > 20 // Ignore very brief answers
    );
  }

  /**
   * Check if answer is off-topic and needs redirect
   */
  needsRedirect(): boolean {
    const answerState = this.getCurrentAnswerState();
    if (!answerState) return false;

    return answerState.isOffTopic && answerState.transcript.length > 100;
  }

  /**
   * Decide next action based on current state
   */
  decideNextAction(): InterviewAction {
    const answerState = this.getCurrentAnswerState();

    console.log("\n" + "=".repeat(70));
    console.log("🎯 DECISION ENGINE - Evaluating State");
    console.log("=".repeat(70));

    if (!answerState) {
      console.log("❌ No answer state found - END_INTERVIEW");
      return InterviewAction.END_INTERVIEW;
    }

    console.log(`📊 Current State:`);
    console.log(`   Confidence: ${answerState.confidence}%`);
    console.log(`   Follow-up Count: ${answerState.followUpCount}/3`);
    console.log(`   Redirect Count: ${answerState.redirectCount || 0}/2`);
    console.log(`   Is Complete: ${answerState.isComplete}`);
    console.log(`   Is Off-Topic: ${answerState.isOffTopic}`);
    console.log(`   Transcript Length: ${answerState.transcript.length} chars`);

    // Check if we've reached the end
    if (this.isInterviewComplete()) {
      console.log("✅ Interview complete - END_INTERVIEW");
      return InterviewAction.END_INTERVIEW;
    }

    console.log("\n🔍 Checking conditions:");

    // Check if off-topic (priority: redirect before anything else) - but limit redirects
    const MAX_REDIRECTS = 2;
    const redirectCount = answerState.redirectCount || 0;
    if (answerState.isOffTopic && redirectCount < MAX_REDIRECTS) {
      console.log(
        `   1. Needs Redirect? true (${redirectCount}/${MAX_REDIRECTS})`,
      );
      console.log("   → Decision: REDIRECT");
      console.log("=".repeat(70) + "\n");
      return InterviewAction.REDIRECT;
    } else if (answerState.isOffTopic && redirectCount >= MAX_REDIRECTS) {
      console.log(
        `   1. User is off-topic but max redirects reached (${redirectCount}/${MAX_REDIRECTS})`,
      );
      console.log("   → Decision: NEXT_QUESTION (moving on despite off-topic)");
      console.log("=".repeat(70) + "\n");
      return InterviewAction.NEXT_QUESTION;
    }
    console.log(`   1. Needs Redirect? false`);

    // Check if answer is good enough to move on (confidence >= 60)
    console.log(
      `   2. Confidence >= 60? ${answerState.confidence >= 60} (${
        answerState.confidence
      }% vs 60%)`,
    );
    if (answerState.confidence >= 60) {
      console.log("   → Decision: NEXT_QUESTION (confidence sufficient)");
      console.log("=".repeat(70) + "\n");
      return InterviewAction.NEXT_QUESTION;
    }

    // Check if needs follow-up (confidence < 60 and haven't exhausted 3 attempts)
    const needsFollowUp = this.needsFollowUp();
    console.log(`   3. Needs Follow-up? ${needsFollowUp}`);
    console.log(`      - followUpCount: ${answerState.followUpCount}/3`);
    console.log(`      - confidence < 60: ${answerState.confidence < 60}`);
    console.log(
      `      - transcript length > 20: ${answerState.transcript.length > 20}`,
    );
    if (needsFollowUp) {
      console.log(
        `   → Decision: FOLLOW_UP (attempt ${answerState.followUpCount + 1}/3)`,
      );
      console.log("=".repeat(70) + "\n");
      return InterviewAction.FOLLOW_UP;
    }

    // If exhausted all 3 follow-ups, move on regardless of confidence
    console.log(`   4. Exhausted follow-ups (${answerState.followUpCount}/3)?`);
    if (answerState.followUpCount >= 3) {
      console.log(
        "   → Decision: NEXT_QUESTION (max follow-ups reached, moving on)",
      );
      console.log("=".repeat(70) + "\n");
      return InterviewAction.NEXT_QUESTION;
    }

    // If transcript is very short (< 20 chars), continue listening
    if (answerState.transcript.length < 20) {
      console.log(
        `   5. Transcript too short (${answerState.transcript.length} < 20 chars)`,
      );
      console.log(
        "   → Decision: CONTINUE (waiting for more substantial answer)",
      );
      console.log("=".repeat(70) + "\n");
      return InterviewAction.CONTINUE;
    }

    // Default: continue listening
    console.log("   → Decision: CONTINUE (default - keep listening)");
    console.log("=".repeat(70) + "\n");
    return InterviewAction.CONTINUE;
  }

  /**
   * Get statistics for metadata
   */
  getStatistics(): {
    totalDuration: number;
    averageAnswerLength: number;
    followUpCount: number;
    redirectionCount: number;
  } {
    const answers = this.getAllAnswers();
    const totalDuration = this.getInterviewDuration();

    const followUpCount = answers.filter((a) => a.followUpAsked).length;
    const redirectionCount = answers.filter((a) => a.isOffTopic).length;

    const averageAnswerLength =
      answers.length > 0 ? Math.floor(totalDuration / answers.length) : 0;

    return {
      totalDuration,
      averageAnswerLength,
      followUpCount,
      redirectionCount,
    };
  }
}
