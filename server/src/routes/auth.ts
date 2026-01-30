import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/auth/sign-up
router.post("/sign-up", AuthController.signUp);

// POST /api/auth/login
router.post("/login", AuthController.login);

// POST /api/auth/verify-email
router.post("/verify-email", AuthController.verifyEmail);

// POST /api/auth/resend-verification
router.post("/resend-verification", AuthController.resendVerification);

// GET /api/auth/me - Get current user (requires authentication)
router.get("/me", authMiddleware, AuthController.getCurrentUser);

// POST /api/auth/logout - Logout user
router.post("/logout", AuthController.logout);

// POST /api/auth/forgot-password - Request password reset
router.post("/forgot-password", AuthController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token
router.post("/reset-password", AuthController.resetPassword);

// PATCH /api/auth/profile - Update user profile (requires authentication)
router.patch("/profile", authMiddleware, AuthController.updateProfile);

// POST /api/auth/verify-email-update - Verify new email (requires authentication)
router.post(
  "/verify-email-update",
  authMiddleware,
  AuthController.verifyEmailUpdate
);

// GET /api/auth/ws-token - Get token for WebSocket authentication (requires authentication)
router.get("/ws-token", authMiddleware, AuthController.getWsToken);

export default router;
