/**
 * Session Registry
 * In-memory storage for active interview sessions
 */

import { InterviewSession } from './InterviewSession';
import { SessionStatus, InterviewPhase } from './types';

const MAX_CONCURRENT_SESSIONS = 100;

class SessionRegistryClass {
    private sessions: Map<string, InterviewSession> = new Map();

    /**
     * Create and register a new session
     */
    async createSession(
        sessionId: string,
        userId: string,
        config: Parameters<typeof InterviewSession.create>[2]
    ): Promise<InterviewSession> {
        if (this.sessions.size >= MAX_CONCURRENT_SESSIONS) {
            throw new Error('Maximum concurrent sessions reached');
        }

        if (this.sessions.has(sessionId)) {
            throw new Error(`Session ${sessionId} already exists`);
        }

        const session = await InterviewSession.create(sessionId, userId, config);
        this.sessions.set(sessionId, session);

        console.log(`[SessionRegistry] Created session ${sessionId} for user ${userId}`);
        return session;
    }

    /**
     * Get a session by ID
     */
    getSession(sessionId: string): InterviewSession | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Check if a session exists
     */
    hasSession(sessionId: string): boolean {
        return this.sessions.has(sessionId);
    }

    /**
     * Remove a session
     */
    async removeSession(sessionId: string): Promise<void> {
        const session = this.sessions.get(sessionId);
        if (session) {
            await session.cleanup();
            this.sessions.delete(sessionId);
            console.log(`[SessionRegistry] Removed session ${sessionId}`);
        }
    }

    /**
     * Get all active session IDs
     */
    getActiveSessionIds(): string[] {
        return Array.from(this.sessions.keys());
    }

    /**
     * Get session count
     */
    getSessionCount(): number {
        return this.sessions.size;
    }

    /**
     * Get status of a session
     */
    getSessionStatus(sessionId: string): SessionStatus | null {
        const session = this.sessions.get(sessionId);
        if (!session) return null;
        return session.getStatus();
    }

    /**
     * Get all sessions for a user
     */
    getUserSessions(userId: string): InterviewSession[] {
        return Array.from(this.sessions.values()).filter(
            session => session.getUserId() === userId
        );
    }

    /**
     * Cleanup all sessions (for shutdown)
     */
    async cleanupAll(): Promise<void> {
        console.log(`[SessionRegistry] Cleaning up ${this.sessions.size} sessions...`);
        const cleanupPromises = Array.from(this.sessions.values()).map(session =>
            session.cleanup().catch(err => {
                console.error(`[SessionRegistry] Error cleaning up session:`, err);
            })
        );
        await Promise.all(cleanupPromises);
        this.sessions.clear();
        console.log('[SessionRegistry] All sessions cleaned up');
    }

    /**
     * Cleanup stale sessions (called periodically)
     */
    async cleanupStaleSessions(maxAgeMs: number = 60 * 60 * 1000): Promise<number> {
        const now = Date.now();
        const staleSessionIds: string[] = [];

        for (const [sessionId, session] of this.sessions) {
            const status = session.getStatus();
            const age = now - status.startedAt.getTime();

            // Cleanup if session is too old or in terminal state
            if (
                age > maxAgeMs ||
                status.phase === InterviewPhase.COMPLETED ||
                status.phase === InterviewPhase.ABANDONED ||
                status.phase === InterviewPhase.ERROR
            ) {
                staleSessionIds.push(sessionId);
            }
        }

        for (const sessionId of staleSessionIds) {
            await this.removeSession(sessionId);
        }

        if (staleSessionIds.length > 0) {
            console.log(`[SessionRegistry] Cleaned up ${staleSessionIds.length} stale sessions`);
        }

        return staleSessionIds.length;
    }
}

// Singleton instance
export const SessionRegistry = new SessionRegistryClass();

// Cleanup on process exit
process.on('SIGINT', async () => {
    console.log('[SessionRegistry] SIGINT received, cleaning up...');
    await SessionRegistry.cleanupAll();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('[SessionRegistry] SIGTERM received, cleaning up...');
    await SessionRegistry.cleanupAll();
    process.exit(0);
});

// Export type for testing/mocking
export type { SessionRegistryClass };
