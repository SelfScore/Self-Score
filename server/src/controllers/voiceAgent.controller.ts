/**
 * Voice Agent Controller
 * Handles HTTP endpoints for voice interview sessions
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRegistry, InterviewPhase } from '../services/voice-agent';

export class VoiceAgentController {
    /**
     * POST /api/voice-interview/start
     * Create a new interview session
     */
    static async startSession(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.body;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'userId is required'
                });
                return;
            }

            // Check if user already has an active session
            const existingSessions = SessionRegistry.getUserSessions(userId);
            const activeSession = existingSessions.find(s => {
                const status = s.getStatus();
                return status.phase === InterviewPhase.READY || status.phase === InterviewPhase.ACTIVE;
            });

            if (activeSession) {
                res.status(409).json({
                    success: false,
                    message: 'User already has an active session',
                    data: {
                        sessionId: activeSession.getSessionId()
                    }
                });
                return;
            }

            // Generate session ID
            const sessionId = uuidv4();

            // Get API keys from environment
            const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
            const geminiApiKey = process.env.GEMINI_API_KEY;

            if (!geminiApiKey) {
                res.status(500).json({
                    success: false,
                    message: 'Gemini API key not configured'
                });
                return;
            }

            if (!deepgramApiKey) {
                res.status(500).json({
                    success: false,
                    message: 'Deepgram API key not configured'
                });
                return;
            }

            // Create session
            const session = await SessionRegistry.createSession(sessionId, userId, {
                geminiApiKey,
                sttApiKey: deepgramApiKey,
                analysisApiKey: geminiApiKey // Using Gemini key for analysis too
            });

            res.status(201).json({
                success: true,
                message: 'Session created successfully',
                data: {
                    sessionId,
                    status: session.getStatus(),
                    // WebRTC signaling info would go here
                    signaling: {
                        wsUrl: `/api/voice-interview/${sessionId}/ws`,
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' }
                        ]
                    }
                }
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error starting session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create session',
                error: (error as Error).message
            });
        }
    }

    /**
     * POST /api/voice-interview/:sessionId/begin
     * Start the actual interview (after WebRTC is established)
     */
    static async beginInterview(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;

            const session = SessionRegistry.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
                return;
            }

            const status = session.getStatus();
            if (status.phase !== InterviewPhase.READY) {
                res.status(400).json({
                    success: false,
                    message: `Cannot start interview in phase: ${status.phase}`
                });
                return;
            }

            await session.startInterview();

            res.json({
                success: true,
                message: 'Interview started',
                data: session.getStatus()
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error beginning interview:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to begin interview',
                error: (error as Error).message
            });
        }
    }

    /**
     * GET /api/voice-interview/:sessionId/status
     * Get interview session status
     */
    static async getSessionStatus(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;

            const status = SessionRegistry.getSessionStatus(sessionId);
            if (!status) {
                res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
                return;
            }

            res.json({
                success: true,
                data: status
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error getting status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get session status',
                error: (error as Error).message
            });
        }
    }

    /**
     * GET /api/voice-interview/:sessionId/state
     * Get full interview state (for admin/debugging)
     */
    static async getSessionState(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;

            const session = SessionRegistry.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    status: session.getStatus(),
                    state: session.getState()
                }
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error getting state:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get session state',
                error: (error as Error).message
            });
        }
    }

    /**
     * POST /api/voice-interview/:sessionId/end
     * End an interview session
     */
    static async endSession(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.params;
            const { reason } = req.body;

            const session = SessionRegistry.getSession(sessionId);
            if (!session) {
                res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
                return;
            }

            await session.endInterview(reason || 'abandoned');
            await SessionRegistry.removeSession(sessionId);

            res.json({
                success: true,
                message: 'Session ended successfully'
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error ending session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to end session',
                error: (error as Error).message
            });
        }
    }

    /**
     * GET /api/voice-interview/active
     * Get list of active sessions (admin only)
     */
    static async getActiveSessions(req: Request, res: Response): Promise<void> {
        try {
            const sessionIds = SessionRegistry.getActiveSessionIds();
            const sessions = sessionIds.map(id => SessionRegistry.getSessionStatus(id));

            res.json({
                success: true,
                data: {
                    count: sessions.length,
                    sessions
                }
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error getting active sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get active sessions',
                error: (error as Error).message
            });
        }
    }

    /**
     * POST /api/voice-interview/cleanup
     * Cleanup stale sessions (admin only)
     */
    static async cleanupStaleSessions(req: Request, res: Response): Promise<void> {
        try {
            const { maxAgeMs } = req.body;
            const cleaned = await SessionRegistry.cleanupStaleSessions(maxAgeMs);

            res.json({
                success: true,
                message: `Cleaned up ${cleaned} stale sessions`,
                data: { cleanedCount: cleaned }
            });

        } catch (error) {
            console.error('[VoiceAgentController] Error cleaning up sessions:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cleanup sessions',
                error: (error as Error).message
            });
        }
    }
}
