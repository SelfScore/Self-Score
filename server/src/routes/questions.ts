import { Router } from "express";
import * as questionControllers from "../controllers/questions.controller";

const router = Router();

// GET /api/questions - Fetch all questions
router.get("/", questionControllers.getAllQuestions);

// GET /api/questions/level/:level - Fetch questions by level (with optional userId query param for responses)
router.get("/level/:level", questionControllers.getQuestionsByLevel);

// GET /api/questions/user/:userId - Fetch questions with user responses
router.get("/user/:userId", questionControllers.getQuestionsWithResponses);

export default router;