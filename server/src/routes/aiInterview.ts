import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
    startInterview,
    submitTextAnswer,
    addTranscript,
    completeInterview,
    getFeedback,
    getInterview,
    getInterviewHistory
} from "../controllers/aiInterview.controller";
import { getReviewByInterviewId } from "../controllers/level4Review.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Start a new interview
router.post("/start", startInterview);

// Submit answer for text mode
router.post("/submit-answer", submitTextAnswer);

// Add transcript for voice mode
router.post("/add-transcript", addTranscript);

// Complete interview
router.post("/complete", completeInterview);

// Get feedback for an interview (deprecated - keeping for backward compatibility)
router.get("/feedback/:interviewId", getFeedback);

// Get admin review for an interview (NEW - replaces AI feedback)
router.get("/review/:interviewId", getReviewByInterviewId);

// Get interview details
router.get("/:interviewId", getInterview);

// Get user's interview history
router.get("/history/all", getInterviewHistory);

export default router;
