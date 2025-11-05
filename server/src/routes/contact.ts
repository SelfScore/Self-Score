import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';

const router = Router();

// Public route - Send contact message
router.post('/send', ContactController.sendMessage);

export default router;
