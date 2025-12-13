import { Router } from 'express';
import { ConsultantController } from '../controllers/consultant.controller';
import { consultantAuthMiddleware } from '../middleware/consultantAuth';

const router = Router();

// Public routes - no authentication required
router.get('/public', ConsultantController.getPublicConsultants);
router.get('/public/:consultantId', ConsultantController.getConsultantById);

// Protected routes - consultant authentication required
router.put('/:consultantId/booking-settings', consultantAuthMiddleware, ConsultantController.updateBookingSettings);

export default router;
