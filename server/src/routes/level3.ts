import express from "express";
import {
    getLevel3Questions,
    submitLevel3Responses,
} from "../controllers/level3.controller";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Get all Level 3 questions (public - for displaying test)
router.get("/questions", getLevel3Questions);

// Submit Level 3 responses (requires authentication)
router.post("/submit", authMiddleware, submitLevel3Responses);

export default router;
