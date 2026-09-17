import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { publicFormLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public route - Send contact message (Protected by rate limiter)
router.post('/send', publicFormLimiter, ContactController.sendMessage);

export default router;
