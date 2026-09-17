import { Router } from 'express';
import { AdminAuthController } from '../controllers/adminAuth.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (Protected by rate limit)
router.post('/login', authLimiter, AdminAuthController.login);

// Protected routes
router.post('/logout', adminAuthMiddleware, AdminAuthController.logout);
router.get('/me', adminAuthMiddleware, AdminAuthController.getCurrentAdmin);

export default router;
