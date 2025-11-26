// import { Router } from 'express';
// import { CalcomController } from '../controllers/calcom.controller';
// import { consultantAuthMiddleware } from '../middleware/consultantAuth';

// const router = Router();

// // Protected routes (require consultant authentication)
// router.get('/auth-url', consultantAuthMiddleware, CalcomController.getAuthUrl);
// router.get('/status', consultantAuthMiddleware, CalcomController.getStatus);
// router.post('/callback', CalcomController.handleCallback);
// router.post('/disconnect', consultantAuthMiddleware, CalcomController.disconnect);
// router.get('/bookings', consultantAuthMiddleware, CalcomController.getConsultantBookings);

// // Webhook endpoint (public, but verified by signature)
// router.post('/webhook', CalcomController.handleWebhook);

// export default router;
