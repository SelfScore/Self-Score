import { Router } from "express";
import { SubscriberController } from "../controllers/subscriber.controller";

const router = Router();

// POST /api/newsletter/subscribe — public, no auth required
router.post("/subscribe", SubscriberController.subscribe);

export default router;
