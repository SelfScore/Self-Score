import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import {
  authLimiter,
  checkEmailLimiter,
  loginLimiter,
  otpResendLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// ---- Sign up / sign in ----
// POST /api/auth/sign-up - email + password, logs in immediately (email verified later)
router.post("/sign-up", authLimiter, AuthController.signUp);

// POST /api/auth/login - email + password
router.post("/login", loginLimiter, AuthController.login);

// POST /api/auth/check-email - email-first sign-up: { exists }
router.post("/check-email", checkEmailLimiter, AuthController.checkEmail);

// POST /api/auth/google - Google ID token (`credential`) or popup auth code (`code`)
router.post("/google", loginLimiter, AuthController.googleAuth);

// Fallback passwordless sign-in (mainly for accounts created before passwords)
router.post("/login/code", otpResendLimiter, AuthController.requestLoginCode);
router.post("/login/code/verify", otpVerifyLimiter, AuthController.verifyLoginCode);

// ---- Email verification ----
// POST /api/auth/verify-email/send - (re)send link + code to the signed-in user
router.post("/verify-email/send", authMiddleware, otpResendLimiter, AuthController.sendVerification);

// POST /api/auth/verify-email - signed-in user enters the 6-digit code
router.post("/verify-email", authMiddleware, otpVerifyLimiter, AuthController.verifyEmailCode);

// POST /api/auth/verify-email/link - token from the email link (must be signed in to that account)
router.post("/verify-email/link", optionalAuthMiddleware, otpVerifyLimiter, AuthController.verifyEmailLink);

// ---- Session ----
router.get("/me", authMiddleware, AuthController.getCurrentUser);
router.post("/logout", AuthController.logout);

// ---- Passwords ----
router.post("/forgot-password", authLimiter, AuthController.forgotPassword);
router.post("/reset-password", authLimiter, AuthController.resetPassword);
// POST /api/auth/password - set a first password or change the current one
router.post("/password", authMiddleware, authLimiter, AuthController.setPassword);

// ---- Profile ----
// PATCH /api/auth/onboarding - country/gender/age right after sign-up (or skip)
router.patch("/onboarding", authMiddleware, AuthController.completeOnboarding);
router.patch("/profile", authMiddleware, AuthController.updateProfile);
router.post(
  "/verify-email-update",
  authMiddleware,
  otpVerifyLimiter,
  AuthController.verifyEmailUpdate
);

// ---- Misc ----
router.get("/unsubscribe-promotional", AuthController.unsubscribePromotional);
// GET /api/auth/ws-token - token for WebSocket authentication
router.get("/ws-token", authMiddleware, AuthController.getWsToken);

export default router;
