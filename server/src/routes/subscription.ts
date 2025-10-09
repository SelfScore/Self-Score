import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
    checkSubscriptionStatus, 
    activateSubscription 
} from '../controllers/subscription.controller';

const router = Router();

// Check current subscription status
router.get('/check', authMiddleware, checkSubscriptionStatus);

// Activate subscription (after payment)
router.post('/activate', authMiddleware, activateSubscription);

export default router;