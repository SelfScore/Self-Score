import { Router } from 'express';
import authRoutes from './auth';
import questionRoutes from './questions';
import questionsResponseRoutes from './questionsResponse';
import subscriptionRoutes from './subscription';
import paymentRoutes from './payment';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/questions-response', questionsResponseRoutes);
router.use('/questions', questionRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/payment', paymentRoutes);


// Health check route
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

export default router;
