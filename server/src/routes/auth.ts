import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/sign-up
router.post('/sign-up', AuthController.signUp);

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/verify-email
router.post('/verify-email', AuthController.verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', AuthController.resendVerification);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// POST /api/auth/logout - Logout user
router.post('/logout', AuthController.logout);

export default router;
