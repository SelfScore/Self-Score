import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LifeScore API Server is running!',
        version: '1.0.0',
        status: 'Server is working without database connection',
        endpoints: {
            health: 'GET /health'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`💡 Test the server: http://localhost:${PORT}`);
});

export default app;
