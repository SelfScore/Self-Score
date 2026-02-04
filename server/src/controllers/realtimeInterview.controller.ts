import { Request, Response } from "express";
import RealtimeInterviewModel, {
  RealtimeInterviewStatus,
} from "../models/realtimeInterview";
import Level5QuestionModel from "../models/level5Question";
import UserModel from "../models/user";
import sessionRegistry from "../services/sessionManager";
import deepgramService from "../services/deepgramService";
import { InterviewController } from "../lib/interviewController";
import { InterviewStateMachine } from "../lib/interviewStateMachine";

/**
 * Start a new realtime voice interview
 */
export const startRealtimeInterview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // CHANGE 1: Check if user already has a session in memory
    const existingSessions = sessionRegistry.getSessionsByUserId(userId);
    if (existingSessions.length > 0) {
      const session = existingSessions[0];
      console.log(
        `✅ Found existing session in memory: ${session.sessionId} - Resuming`
      );

      // Get current question for display
      const currentQuestion = session.questions[session.currentQuestionIndex];

      res.status(200).json({
        success: true,
        message:
          "Welcome back! Resuming your interview from where you left off.",
        data: {
          sessionId: session.sessionId,
          interviewId: session.interviewId,
          totalQuestions: session.questions.length,
          currentQuestionIndex: session.currentQuestionIndex,
          currentQuestion,
          answeredCount: session.answers.size,
          isResuming: true,
        },
      });
      return;
    }

    // CHANGE 2: Check if user has an active interview in database (but not in memory)
    const existingInterview = await RealtimeInterviewModel.findOne({
      userId,
      level: 5,
      status: RealtimeInterviewStatus.IN_PROGRESS,
    });

    if (existingInterview) {
      console.log(
        `✅ Found existing interview in DB (not in memory): ${existingInterview._id} - Restoring session`
      );

      // Restore session from database
      const restoredSessionId = await sessionRegistry.restoreSessionFromDB(
        existingInterview
      );

      const session = sessionRegistry.getSession(restoredSessionId);
      if (!session) {
        res.status(500).json({
          success: false,
          message: "Failed to restore session",
        });
        return;
      }

      const currentQuestion = session.questions[session.currentQuestionIndex];

      res.status(200).json({
        success: true,
        message: "Welcome back! Restoring your interview session.",
        data: {
          sessionId: restoredSessionId,
          interviewId: existingInterview._id,
          totalQuestions: session.questions.length,
          currentQuestionIndex: session.currentQuestionIndex,
          currentQuestion,
          answeredCount: session.answers.size,
          isResuming: true,
        },
      });
      return;
    }

    // Fetch questions from database (minimum 5 for testing)
    const dbQuestions = await Level5QuestionModel.find({ level: 5 }).sort({
      order: 1,
    });

    if (!dbQuestions || dbQuestions.length < 5) {
      res.status(500).json({
        success: false,
        message:
          "Level 5 questions not properly configured. Please contact administrator.",
      });
      return;
    }

    // Check if user has remaining attempts (pay-per-use)
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const remainingAttempts = user.purchasedLevels?.level5?.remainingAttempts || 0;
    if (remainingAttempts <= 0) {
      res.status(403).json({
        success: false,
        message: "No remaining attempts for Level 5. Please purchase to continue.",
        data: {
          remainingAttempts: 0,
          requiresPurchase: true
        }
      });
      return;
    }

    // Transform questions
    const questions = dbQuestions.map((q) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      order: q.order,
    }));

    // Generate sessionId first
    const tempSessionId = sessionRegistry.generateSessionId();

    // Create interview document with sessionId
    const interview = await RealtimeInterviewModel.create({
      userId,
      sessionId: tempSessionId,
      level: 5,
      status: RealtimeInterviewStatus.IN_PROGRESS,
      questions,
      answers: [],
      interviewMetadata: {
        totalDuration: 0,
        averageAnswerLength: 0,
        followUpCount: 0,
        redirectionCount: 0,
      },
      startedAt: new Date(),
    });

    // Create session with the same sessionId
    const sessionId = sessionRegistry.createSession(
      userId,
      (interview._id as string).toString(),
      questions,
      tempSessionId
    );

    console.log(
      `✅ Realtime interview started - Session: ${sessionId}, Interview: ${interview._id}`
    );

    res.status(201).json({
      success: true,
      message: "Interview started successfully",
      data: {
        sessionId,
        interviewId: interview._id,
        totalQuestions: questions.length,
        firstQuestion: questions[0],
      },
    });
  } catch (error: any) {
    console.error("❌ Error starting realtime interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start interview",
      error: error.message,
    });
  }
};

/**
 * Initialize WebSocket connection for audio streaming
 * This is called after startRealtimeInterview
 */
export const initializeAudioConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
      return;
    }

    const session = sessionRegistry.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
      return;
    }

    if (session.userId !== userId) {
      res.status(403).json({
        success: false,
        message: "Session does not belong to this user",
      });
      return;
    }

    // WebSocket connection will be established via WebSocket endpoint
    // This endpoint just validates the session

    res.status(200).json({
      success: true,
      message: "Session validated. Ready to connect WebSocket.",
      data: {
        wsUrl: `/ws/interview/${sessionId}`,
        sessionId,
      },
    });
  } catch (error: any) {
    console.error("❌ Error initializing audio connection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize audio connection",
      error: error.message,
    });
  }
};

/**
 * Complete and save interview
 */
export const completeRealtimeInterview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const session = sessionRegistry.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
      return;
    }

    if (session.userId !== userId) {
      res.status(403).json({
        success: false,
        message: "Session does not belong to this user",
      });
      return;
    }

    // Get interview document
    const interview = await RealtimeInterviewModel.findById(
      session.interviewId
    );

    if (!interview) {
      res.status(404).json({
        success: false,
        message: "Interview not found",
      });
      return;
    }

    // Get final answers from state machine
    const stateMachine = new InterviewStateMachine(session);
    const finalAnswers = stateMachine.getAllAnswers();
    const statistics = stateMachine.getStatistics();

    // Update interview with final data
    // Filter out answers with empty transcripts (unanswered questions)
    interview.answers = finalAnswers
      .filter(
        (answer) => answer.transcript && answer.transcript.trim().length > 0
      )
      .map((answer) => ({
        questionId: answer.questionId,
        transcript: answer.transcript,
        confidence: answer.confidence,
        isComplete: answer.isComplete,
        isOffTopic: answer.isOffTopic,
        missingAspects: answer.missingAspects,
        followUpAsked: answer.followUpAsked,
        audioTimestamp: {
          start: new Date(answer.audioStartTime),
          end: new Date(Date.now()),
        },
      }));

    interview.interviewMetadata = statistics;
    interview.status = RealtimeInterviewStatus.COMPLETED;
    interview.completedAt = new Date();
    interview.submittedAt = new Date();

    await interview.save();

    // Update user's Level 5 progress to PENDING_REVIEW and consume attempt
    const user = await UserModel.findById(userId);
    if (user) {
      // Consume the Level 5 attempt (pay-per-use)
      if (user.purchasedLevels?.level5?.remainingAttempts > 0) {
        user.purchasedLevels.level5.remainingAttempts -= 1;
        console.log(`✅ Level 5 attempt consumed. Remaining attempts: ${user.purchasedLevels.level5.remainingAttempts}`);
      }
      user.progress.level5 = "PENDING_REVIEW";
      await user.save();
    }

    console.log(
      `✅ Interview completed - User ${userId} Level 5 status: PENDING_REVIEW`
    );

    // Cleanup session
    await sessionRegistry.deleteSession(sessionId);

    console.log(`✅ Interview completed and saved - ID: ${interview._id}`);

    res.status(200).json({
      success: true,
      message: "Interview completed successfully",
      data: {
        interviewId: interview._id,
        totalQuestions: interview.questions.length,
        answeredQuestions: finalAnswers.filter((a) => a.isComplete).length,
        statistics,
      },
    });
  } catch (error: any) {
    console.error("❌ Error completing interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete interview",
      error: error.message,
    });
  }
};

/**
 * Get interview progress
 */
export const getInterviewProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const session = sessionRegistry.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found or expired",
      });
      return;
    }

    if (session.userId !== userId) {
      res.status(403).json({
        success: false,
        message: "Session does not belong to this user",
      });
      return;
    }

    const controller = new InterviewController(session);
    const progress = controller.getProgress();

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error("❌ Error getting interview progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get progress",
      error: error.message,
    });
  }
};

/**
 * Abandon interview (cleanup without saving)
 */
export const abandonInterview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const session = sessionRegistry.getSession(sessionId);

    if (session && session.userId === userId) {
      // Update interview status
      await RealtimeInterviewModel.findByIdAndUpdate(session.interviewId, {
        status: RealtimeInterviewStatus.ABANDONED,
        completedAt: new Date(),
      });

      // Cleanup session
      await sessionRegistry.deleteSession(sessionId);
    }

    res.status(200).json({
      success: true,
      message: "Interview abandoned",
    });
  } catch (error: any) {
    console.error("❌ Error abandoning interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to abandon interview",
      error: error.message,
    });
  }
};

/**
 * Check if user has an active Level 5 interview
 */
export const checkActiveRealtimeInterview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Check for active session in memory
    const existingSessions = sessionRegistry.getSessionsByUserId(userId);
    if (existingSessions.length > 0) {
      const session = existingSessions[0];
      res.status(200).json({
        success: true,
        data: {
          hasActiveInterview: true,
          sessionId: session.sessionId,
          interviewId: session.interviewId,
          progress: session.currentQuestionIndex,
        },
      });
      return;
    }

    // Check for active interview in database
    const activeInterview = await RealtimeInterviewModel.findOne({
      userId,
      level: 5,
      status: RealtimeInterviewStatus.IN_PROGRESS,
    });

    res.status(200).json({
      success: true,
      data: {
        hasActiveInterview: !!activeInterview,
        sessionId: activeInterview?.sessionId || null,
        interviewId: activeInterview?._id || null,
        progress: activeInterview?.answers.length || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Error checking active realtime interview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check active interview",
      error: error.message,
    });
  }
};

