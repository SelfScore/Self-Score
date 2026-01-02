import { Router } from "express";
import { ConsultantAuthController } from "../controllers/consultantAuth.controller";
import { consultantAuthMiddleware } from "../middleware/consultantAuth";

const router = Router();

// Public routes
router.post("/register/step1", ConsultantAuthController.registerStep1);
router.post("/verify-email", ConsultantAuthController.verifyEmail);
router.post(
  "/resend-verification",
  ConsultantAuthController.resendVerification
);
router.post("/login", ConsultantAuthController.login);

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
  ConsultantAuthController.verifyEmailUpdate
);
router.put(
  "/update-availability",
  consultantAuthMiddleware,
  ConsultantAuthController.updateAvailability
);

export default router;
