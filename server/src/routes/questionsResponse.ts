import { Router } from "express";
import * as questionsResponseController from "../controllers/questionsResponse.controller";

const router = Router();

// POST /api/questions-response - Save a user's question response
router.post("/", questionsResponseController.createQuestionsResponse);

// POST /api/questions-response/level1 - Save a user's question response for Level 1
router.post("/level1", questionsResponseController.createLevel1Response);

// GET /api/questions-response/user/:userId - Get all responses of a user
router.get("/user/:userId", questionsResponseController.getUserResponses);

export default router;