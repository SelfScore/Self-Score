import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dbConnect from './lib/dbConnect';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001', // Add port 3001 for development
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Stripe webhook needs raw body for signature verification
// Must be before express.json()
app.post('/api/payment/webhook', 
    express.raw({ type: 'application/json' }),
    async (req, res, next) => {
        // Import and use the webhook handler directly
        const { PaymentController } = await import('./controllers/payment.controller');
        PaymentController.handleWebhook(req, res);
    }
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LifeScore API Server is running!',
        version: '1.0.0',
        endpoints: {
            auth: {
                signUp: 'POST /api/auth/sign-up',
                login: 'POST /api/auth/login',
                verifyEmail: 'POST /api/auth/verify-email',
                resendVerification: 'POST /api/auth/resend-verification',
                getCurrentUser: 'GET /api/auth/me (requires auth)',
                logout: 'POST /api/auth/logout'
            },
            questions: {
                getAllQuestions: 'GET /api/questions',
                getQuestionsByLevel: 'GET /api/questions/level/:level',
                getQuestionsWithResponses: 'GET /api/questions/user/:userId'
            },
            questionsResponse: {
                createResponse: 'POST /api/questions-response',
                getUserResponses: 'GET /api/questions-response/user/:userId'
            },
            contact: {
                sendMessage: 'POST /api/contact/send'
            },
            admin: {
                messages: 'GET /api/admin/messages (requires admin auth)',
                messageDetails: 'GET /api/admin/messages/:messageId (requires admin auth)',
                updateMessage: 'PATCH /api/admin/messages/:messageId (requires admin auth)'
            },
            health: 'GET /api/health'
        }
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to database and start server
const startServer = async (): Promise<void> => {
    try {
        // Try to connect to database (won't crash if it fails)
        await dbConnect();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
            console.log(`🗄️  Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/lifescore'}`);
            console.log(`💡 Test the server: http://localhost:${PORT}`);
            console.log('📚 Available endpoints:');
            console.log('   GET  / - API information');
            console.log('   GET  /api/health - Health check');
            console.log('   POST /api/auth/sign-up - User registration');
            console.log('   POST /api/auth/login - User login');
            console.log('   POST /api/auth/verify-email - Verify email');
            console.log('   POST /api/auth/resend-verification - Resend verification');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
});

// Start the server
startServer();

export default app;
