import { Router } from 'express';
import { ConsultantController } from '../controllers/consultant.controller';

const router = Router();

// Public routes - no authentication required
router.get('/public', ConsultantController.getPublicConsultants);
router.get('/public/:consultantId', ConsultantController.getConsultantById);

export default router;
