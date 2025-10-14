import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
    checkSubscriptionStatus
} from '../controllers/subscription.controller';

const router = Router();

// Check purchased levels status (replaces old subscription check)
router.get('/check', authMiddleware, checkSubscriptionStatus);

// Note: Old activate endpoint removed - use payment endpoints instead
// POST /api/payment/create-checkout for new purchases

export default router;