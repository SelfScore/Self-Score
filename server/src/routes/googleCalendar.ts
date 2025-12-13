import { Router } from 'express';
import { GoogleCalendarController } from '../controllers/googleCalendar.controller';
import { consultantAuthMiddleware } from '../middleware/consultantAuth';

const router = Router();

// All routes require consultant authentication
router.use(consultantAuthMiddleware);

/**
 * @route   GET /api/google-calendar/auth-url
 * @desc    Get Google OAuth URL to initiate calendar connection
 * @access  Private (Consultant)
 */
router.get('/auth-url', GoogleCalendarController.initiateOAuth);

/**
 * @route   GET /api/google-calendar/callback
 * @desc    Handle OAuth callback from Google
 * @access  Public (called by Google)
 * @note    State parameter contains consultantId for verification
 */
router.get('/callback', GoogleCalendarController.handleCallback);

/**
 * @route   POST /api/google-calendar/disconnect
 * @desc    Disconnect Google Calendar from consultant account
 * @access  Private (Consultant)
 */
router.post('/disconnect', GoogleCalendarController.disconnectCalendar);

/**
 * @route   GET /api/google-calendar/status
 * @desc    Get Google Calendar connection status
 * @access  Private (Consultant)
 */
router.get('/status', GoogleCalendarController.getStatus);

export default router;
