import { Router } from 'express';
import { adminAuthMiddleware } from '../middleware/adminAuth';
import {
    getAllLevel4Submissions,
    getLevel4SubmissionDetails,
    saveDraftReview,
    submitFinalReview
} from '../controllers/level4Review.controller';

const router = Router();

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Get all Level 4 submissions (with search and pagination)
router.get('/submissions', getAllLevel4Submissions);

// Get single submission details
router.get('/submissions/:interviewId', getLevel4SubmissionDetails);

// Save draft review (admin can save progress)
router.patch('/submissions/:interviewId/draft', saveDraftReview);

// Submit final review (completes review and notifies user)
router.post('/submissions/:interviewId/submit', submitFinalReview);

export default router;
