import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  startRealtimeInterview,
  initializeAudioConnection,
  completeRealtimeInterview,
  getInterviewProgress,
  abandonInterview,
  checkActiveRealtimeInterview,
} from "../controllers/realtimeInterview.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Start new realtime interview
router.post("/start", startRealtimeInterview);

// Initialize audio connection (validates session before WebSocket)
router.post("/connect", initializeAudioConnection);

// Complete interview and save
router.post("/complete", completeRealtimeInterview);

// Get interview progress
router.get("/progress/:sessionId", getInterviewProgress);

// Abandon interview
router.post("/abandon", abandonInterview);

// Check if user has an active interview
router.get("/check-active", checkActiveRealtimeInterview);

export default router;
