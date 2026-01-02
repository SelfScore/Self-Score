import express from "express";
import {
  getAllLevel5Submissions,
  getLevel5SubmissionById,
  saveLevel5Review,
  submitLevel5Review,
  getUserLevel5Review,
} from "../controllers/level5Review.controller";
import { authMiddleware } from "../middleware/auth";
import { adminAuthMiddleware } from "../middleware/adminAuth";

const router = express.Router();

// Admin routes
router.get("/submissions", adminAuthMiddleware, getAllLevel5Submissions);
router.get(
  "/submissions/:interviewId",
  adminAuthMiddleware,
  getLevel5SubmissionById
);
router.post(
  "/submissions/:interviewId/save",
  adminAuthMiddleware,
  saveLevel5Review
);
router.post(
  "/submissions/:interviewId/submit",
  adminAuthMiddleware,
  submitLevel5Review
);

// User routes
router.get("/user/review", authMiddleware, getUserLevel5Review);

export default router;
