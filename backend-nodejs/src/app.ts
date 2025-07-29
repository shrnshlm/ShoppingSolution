import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import orderRoutes from './routes/orders';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3001');

// Security middleware
app.use(helmet());

// CORS configuration for React frontend
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5000', 
        'https://localhost:5001',
        'http://localhost:5173',    // ← הוסף את זה!
        'https://localhost:5173'     // ← וגם את זה
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping_orders');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB();

// Routes
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
    res.status(200).json({
        status: 'OK',
        message: 'Order Service is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response): void => {
    res.json({
        message: 'Order Service API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            orders: '/api/orders'
        }
    });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req: Request, res: Response): void => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Graceful shutdown
process.on('SIGINT', async (): Promise<void> => {
    console.log('\n🔄 Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});

app.listen(PORT, (): void => {
    console.log(`🚀 Order Service running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;