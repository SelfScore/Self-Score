import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import {
  authLimiter,
  otpResendLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// POST /api/auth/sign-up (Protected by IP rate limit)
router.post("/sign-up", authLimiter, AuthController.signUp);

// POST /api/auth/login (Protected by IP rate limit)
router.post("/login", authLimiter, AuthController.login);

// POST /api/auth/verify-email (Protected by brute-force rate limit)
router.post("/verify-email", otpVerifyLimiter, AuthController.verifyEmail);

// POST /api/auth/resend-verification (Protected by resend rate limit)
router.post(
  "/resend-verification",
  otpResendLimiter,
  AuthController.resendVerification
);

// GET /api/auth/unsubscribe-promotional
router.get(
  "/unsubscribe-promotional",
  AuthController.unsubscribePromotional
);

// GET /api/auth/me - Get current user (requires authentication)
router.get("/me", authMiddleware, AuthController.getCurrentUser);

// POST /api/auth/logout - Logout user
router.post("/logout", AuthController.logout);

// POST /api/auth/forgot-password - Request password reset (Protected by IP rate limit)
router.post("/forgot-password", authLimiter, AuthController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post("/reset-password", authLimiter, AuthController.resetPassword);

// PATCH /api/auth/profile - Update user profile (requires authentication)
router.patch("/profile", authMiddleware, AuthController.updateProfile);

// POST /api/auth/verify-email-update - Verify new email (requires authentication + brute-force limit)
router.post(
  "/verify-email-update",
  authMiddleware,
  otpVerifyLimiter,
  AuthController.verifyEmailUpdate
);

// GET /api/auth/ws-token - Get token for WebSocket authentication (requires authentication)
router.get("/ws-token", authMiddleware, AuthController.getWsToken);

export default router;
