import { Router } from "express";
import * as questionsResponseController from "../controllers/questionsResponse.controller";

const router = Router();

// POST /api/questions-response - Save a user's question response
router.post("/", questionsResponseController.createQuestionsResponse);

// GET /api/questions-response/user/:userId - Get all responses of a user
router.get("/user/:userId", questionsResponseController.getUserResponses);

export default router;