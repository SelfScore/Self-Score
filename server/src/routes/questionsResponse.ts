import { Router } from "express";
import * as questionsResponseController from "../controllers/questionsResponse.controller";
import { authMiddleware, bindBodyUserId, requireSelfParam } from "../middleware/auth";

const router = Router();

// POST /api/questions-response - Save a user's question response (single)
router.post("/", authMiddleware, bindBodyUserId, questionsResponseController.createQuestionsResponse);

// POST /api/questions-response/level1 - Save Level 1 responses (batch)
router.post("/level1", authMiddleware, bindBodyUserId, questionsResponseController.createLevel1Response);

// POST /api/questions-response/submit-level - Save responses for any level (2, 3, 4)
router.post("/submit-level", authMiddleware, bindBodyUserId, questionsResponseController.submitLevelResponses);

// GET /api/questions-response/user/:userId - Get all responses of a user
router.get("/user/:userId", authMiddleware, requireSelfParam("userId"), questionsResponseController.getUserResponses);

// GET /api/questions-response/test-history/:userId - Get user's test history with scores and dates
router.get("/test-history/:userId", authMiddleware, requireSelfParam("userId"), questionsResponseController.getUserTestHistory);

// POST /api/questions-response/generate-share-link - Generate a shareable link for a test submission (requires auth)
router.post("/generate-share-link", authMiddleware, questionsResponseController.generateShareLink);

// GET /api/questions-response/shared-report/:shareId - Get shared report data (public)
router.get("/shared-report/:shareId", questionsResponseController.getSharedReport);

export default router;