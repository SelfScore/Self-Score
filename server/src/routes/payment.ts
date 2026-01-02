import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/payment/create-checkout - Create Stripe checkout session (requires auth)
router.post(
  "/create-checkout",
  authMiddleware,
  PaymentController.createCheckoutSession
);

// POST /api/payment/verify - Verify payment after redirect (requires auth)
router.post("/verify", authMiddleware, PaymentController.verifyPayment);

// Note: Webhook route is handled in index.ts with raw body parser

// GET /api/payment/history - Get user payment history (requires auth)
router.get("/history", authMiddleware, PaymentController.getPaymentHistory);

// GET /api/payment/invoice/:sessionId - Download invoice (requires auth)
router.get(
  "/invoice/:sessionId",
  authMiddleware,
  PaymentController.downloadInvoice
);

export default router;
