import { Router } from "express";
import { SubscriberController } from "../controllers/subscriber.controller";
import { publicFormLimiter } from "../middleware/rateLimiter";

const router = Router();

// POST /api/newsletter/subscribe — public (Protected by rate limiter)
router.post("/subscribe", publicFormLimiter, SubscriberController.subscribe);

export default router;
