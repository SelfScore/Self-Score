/**
 * Voice Agent Routes
 * REST API endpoints for voice interview sessions
 */

import { Router } from 'express';
import { VoiceAgentController } from '../controllers/voiceAgent.controller';

const router = Router();

// Session management
router.post('/start', VoiceAgentController.startSession);
router.post('/:sessionId/begin', VoiceAgentController.beginInterview);
router.post('/:sessionId/end', VoiceAgentController.endSession);

// Session status
router.get('/:sessionId/status', VoiceAgentController.getSessionStatus);
router.get('/:sessionId/state', VoiceAgentController.getSessionState);

// Admin endpoints
router.get('/active', VoiceAgentController.getActiveSessions);
router.post('/cleanup', VoiceAgentController.cleanupStaleSessions);

export default router;
