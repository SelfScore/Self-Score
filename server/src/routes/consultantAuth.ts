import { Router } from "express";
import { ConsultantAuthController } from "../controllers/consultantAuth.controller";
import { consultantAuthMiddleware } from "../middleware/consultantAuth";
import {
  authLimiter,
  otpResendLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter";

const router = Router();

// Public routes
router.post(
  "/register/step1",
  authLimiter,
  ConsultantAuthController.registerStep1
);
router.post(
  "/verify-email",
  otpVerifyLimiter,
  ConsultantAuthController.verifyEmail
);
router.post(
  "/resend-verification",
  otpResendLimiter,
  ConsultantAuthController.resendVerification
);
router.post("/login", authLimiter, ConsultantAuthController.login);

// Protected routes (require authentication)
router.post("/register/step2", ConsultantAuthController.updateProfessionalInfo);
router.post("/register/step3", ConsultantAuthController.updateCertifications);
router.post("/register/step4", ConsultantAuthController.completeRegistration);
router.get(
  "/me",
  consultantAuthMiddleware,
  ConsultantAuthController.getCurrentConsultant
);
router.post(
  "/logout",
  consultantAuthMiddleware,
  ConsultantAuthController.logout
);

// Profile management routes (require authentication)
router.put(
  "/update-personal",
  consultantAuthMiddleware,
  ConsultantAuthController.updatePersonalInfo
);
router.post(
  "/verify-email-update",
  consultantAuthMiddleware,
  otpVerifyLimiter,
  ConsultantAuthController.verifyEmailUpdate
);
router.put(
  "/update-availability",
  consultantAuthMiddleware,
  ConsultantAuthController.updateAvailability
);

export default router;
