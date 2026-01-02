import { v4 as uuidv4 } from "uuid";
import { InterviewSession, Question } from "../types/realtimeInterview.types";

/**
 * SessionRegistry - Manages all active interview sessions
 * In-memory storage for real-time interview state
 */
class SessionRegistry {
  private sessions: Map<string, InterviewSession>;
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.sessions = new Map();
    this.startCleanupTimer();
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return uuidv4();
  }

  /**
   * Create a new interview session
   */
  createSession(
    userId: string,
    interviewId: string,
    questions: Question[],
    sessionId?: string
  ): string {
    const finalSessionId = sessionId || uuidv4();

    const session: InterviewSession = {
      sessionId: finalSessionId,
      userId,
      interviewId,
      currentQuestionIndex: 0,
      questions,
      answers: new Map(),
      wsConnection: null,
      deepgramConnection: null,
      geminiConnection: null,
      lastAudioTimestamp: 0,
      silenceTimer: null,
      isAISpeaking: false,
      isUserSpeaking: false,
      audioBuffer: [],
      currentTranscript: "",
      pendingAnalysis: null,
      startTime: Date.now(),
      lastActivityTime: Date.now(),
    };

    this.sessions.set(finalSessionId, session);
    console.log(`✅ Session created: ${finalSessionId} for user: ${userId}`);

    return finalSessionId;
  }

  /**
   * Get an existing session
   */
  getSession(sessionId: string): InterviewSession | null {
    const session = this.sessions.get(sessionId);

    if (session) {
      // Update last activity time
      session.lastActivityTime = Date.now();
      return session;
    }

    console.warn(`⚠️  Session not found: ${sessionId}`);
    return null;
  }

  /**
   * Update session state
   */
  updateSession(
    sessionId: string,
    updates: Partial<InterviewSession>
  ): boolean {
    const session = this.sessions.get(sessionId);

    if (!session) {
      console.warn(`⚠️  Cannot update - session not found: ${sessionId}`);
      return false;
    }

    Object.assign(session, updates);
    session.lastActivityTime = Date.now();

    return true;
  }

  /**
   * Delete a session and cleanup connections
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      console.warn(`⚠️  Cannot delete - session not found: ${sessionId}`);
      return false;
    }

    console.log(`🧹 Cleaning up session: ${sessionId}`);

    // Cleanup connections
    try {
      if (session.silenceTimer) {
        clearTimeout(session.silenceTimer);
      }

      if (session.deepgramConnection) {
        session.deepgramConnection.finish();
      }

      if (session.geminiConnection) {
        // Close Gemini Live API connection
        if (session.geminiConnection.readyState === 1) {
          session.geminiConnection.close();
        }
      }

      if (session.wsConnection) {
        session.wsConnection.close();
      }

      // Clear audio buffer
      session.audioBuffer = [];
    } catch (error) {
      console.error(`❌ Error during session cleanup:`, error);
    }

    // Remove from registry
    const deleted = this.sessions.delete(sessionId);

    if (deleted) {
      console.log(`✅ Session deleted: ${sessionId}`);
    }

    return deleted;
  }

  /**
   * Get all active sessions (for monitoring)
   */
  getActiveSessions(): InterviewSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Check if session exists
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Get sessions by user ID
   */
  getSessionsByUserId(userId: string): InterviewSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  /**
   * Restore session from database (for resuming interrupted interviews)
   */
  async restoreSessionFromDB(interview: any): Promise<string> {
    const sessionId = interview.sessionId || this.generateSessionId();
    const userId = interview.userId.toString();
    const interviewId = interview._id.toString();

    console.log(`🔄 Restoring session from DB: ${sessionId}`);

    // Rebuild questions array
    const questions = interview.questions.map((q: any) => ({
      questionId: q.questionId,
      questionText: q.questionText,
      order: q.order,
    }));

    // Create new session
    const session: InterviewSession = {
      sessionId,
      userId,
      interviewId,
      currentQuestionIndex: 0, // Will be updated below
      questions,
      answers: new Map(),
      wsConnection: null,
      deepgramConnection: null,
      geminiConnection: null,
      lastAudioTimestamp: 0,
      silenceTimer: null,
      isAISpeaking: false,
      isUserSpeaking: false,
      audioBuffer: [],
      currentTranscript: "",
      pendingAnalysis: null,
      startTime: interview.startedAt?.getTime() || Date.now(),
      lastActivityTime: Date.now(),
    };

    // Restore answers from database
    if (interview.answers && interview.answers.length > 0) {
      interview.answers.forEach((answer: any) => {
        session.answers.set(answer.questionId, {
          questionId: answer.questionId,
          transcript: answer.transcript,
          confidence: answer.confidence,
          isComplete: answer.isComplete,
          isOffTopic: answer.isOffTopic,
          missingAspects: answer.missingAspects || [],
          suggestedFollowUp: "",
          followUpAsked: answer.followUpAsked || false,
          followUpCount: answer.followUpCount || 0,
          audioStartTime: answer.audioTimestamp?.start?.getTime() || Date.now(),
        });
      });
    }

    // Determine current question index (first unanswered question)
    const answeredQuestionIds = new Set(
      interview.answers?.map((a: any) => a.questionId) || []
    );
    const firstUnansweredIndex = questions.findIndex(
      (q: any) => !answeredQuestionIds.has(q.questionId)
    );

    session.currentQuestionIndex =
      firstUnansweredIndex !== -1 ? firstUnansweredIndex : questions.length;

    console.log(
      `✅ Session restored - Current question: ${
        session.currentQuestionIndex + 1
      }/${questions.length}, Answers: ${session.answers.size}`
    );

    // Store in registry
    this.sessions.set(sessionId, session);

    return sessionId;
  }

  /**
   * Cleanup expired sessions (runs every 5 minutes)
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Remove sessions that have been idle too long
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const idleTime = now - session.lastActivityTime;

      if (idleTime > this.SESSION_TIMEOUT_MS) {
        expiredSessions.push(sessionId);
      }
    }

    if (expiredSessions.length > 0) {
      console.log(`🧹 Cleaning up ${expiredSessions.length} expired sessions`);

      for (const sessionId of expiredSessions) {
        await this.deleteSession(sessionId);
      }
    }
  }

  /**
   * Gracefully shutdown all sessions
   */
  async shutdown(): Promise<void> {
    console.log(
      `🛑 Shutting down SessionRegistry - ${this.sessions.size} active sessions`
    );

    const sessionIds = Array.from(this.sessions.keys());

    for (const sessionId of sessionIds) {
      await this.deleteSession(sessionId);
    }

    console.log(`✅ All sessions cleaned up`);
  }
}

// Singleton instance
const sessionRegistry = new SessionRegistry();

export default sessionRegistry;
