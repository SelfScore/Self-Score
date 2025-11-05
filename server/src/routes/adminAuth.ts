import { Router } from 'express';
import { AdminAuthController } from '../controllers/adminAuth.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// Public routes
router.post('/login', AdminAuthController.login);

// Protected routes
router.post('/logout', adminAuthMiddleware, AdminAuthController.logout);
router.get('/me', adminAuthMiddleware, AdminAuthController.getCurrentAdmin);

export default router;
