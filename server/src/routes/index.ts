import { Router } from 'express';
import authRoutes from './auth';
import questionRoutes from './questions';
import questionsResponseRoutes from './questionsResponse';
import subscriptionRoutes from './subscription';
import paymentRoutes from './payment';
import adminRoutes from './admin';
import adminAuthRoutes from './adminAuth';
import contactRoutes from './contact';
import aiInterviewRoutes from './aiInterview';
import level4ReviewRoutes from './level4Review';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/questions-response', questionsResponseRoutes);
router.use('/questions', questionRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/payment', paymentRoutes);
router.use('/contact', contactRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/level4', level4ReviewRoutes);
router.use('/ai-interview', aiInterviewRoutes);


// Health check route
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

export default router;
