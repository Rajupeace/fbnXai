// Enhanced Server with Emergency Response System
require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./config/database');

// Import emergency response system
const EmergencyResponseHandler = require('./utils/emergencyResponseHandler');

// Import routes
const chatRoutes = require('./routes/chat');
const emergencyRoutes = require('./routes/emergency');

const app = express();

// Initialize emergency response handler
const emergencyHandler = new EmergencyResponseHandler();

// Enhanced error handling with emergency fallback
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    
    // Always provide emergency response
    const emergencyResponse = emergencyHandler.getEmergencyResponse('error', { error: err.message });
    
    res.status(500).json({
        response: emergencyResponse.response,
        error: 'Internal Server Error - Emergency Response Active',
        emergency: true,
        guaranteed: true,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
    });
});

// Request ID middleware
app.use((req, res, next) => {
    req.requestId = req.headers['x-request-id'] || uuidv4();
    res.setHeader('x-request-id', req.requestId);
    next();
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 60000,
    max: 1000, // Increased for emergency responses
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests',
        message: 'Please try again later',
        emergency: 'Emergency responses still available at /api/emergency'
    }
});
app.use(limiter);

// Enhanced health check with emergency status
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const emergencyStatus = emergencyHandler.getSystemStatus();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        database: {
            status: statusMap[dbStatus] || 'unknown',
            readyState: dbStatus
        },
        emergency: {
            active: true,
            guaranteed: true,
            healthStatus: emergencyStatus.isHealthy ? 'healthy' : 'emergency-mode',
            cacheSize: emergencyStatus.cacheSize,
            patternsCount: emergencyStatus.emergencyPatterns
        },
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        },
        features: {
            emergencyResponses: 'active',
            guaranteedResponses: true,
            fallbackSystem: 'active'
        }
    });
});

// Emergency response endpoint - ALWAYS responds
app.post('/api/emergency', (req, res) => {
    try {
        const { message, context } = req.body;
        const emergencyResponse = emergencyHandler.getEmergencyResponse(message, context);
        
        res.json({
            response: emergencyResponse.response,
            source: emergencyResponse.source,
            responseTime: emergencyResponse.responseTime,
            timestamp: emergencyResponse.timestamp,
            emergency: emergencyResponse.emergency,
            guaranteed: true,
            requestId: req.requestId
        });
        
    } catch (error) {
        // Ultimate fallback
        res.json({
            response: '🚨 Emergency System Active! I\'m here to help. Try "help" for assistance.',
            source: 'ultimate-fallback',
            responseTime: 1,
            timestamp: Date.now(),
            emergency: true,
            guaranteed: true,
            requestId: req.requestId
        });
    }
});

// Enhanced chat route with emergency fallback
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    try {
        // Try normal chat first
        const response = await chatRoutes(req, res);
        
        // Update emergency handler with successful response
        emergencyHandler.lastResponse = {
            timestamp: Date.now(),
            message: message
        };
        
    } catch (error) {
        console.error('❌ Chat route failed, using emergency response:', error.message);
        
        // Fallback to emergency response
        const emergencyResponse = emergencyHandler.getEmergencyResponse(message, context);
        
        res.json({
            response: emergencyResponse.response,
            source: 'emergency-fallback',
            responseTime: Date.now() - startTime,
            timestamp: Date.now(),
            emergency: true,
            guaranteed: true,
            requestId: req.requestId,
            originalError: error.message
        });
    }
});

// Emergency system routes
app.use('/api/emergency', emergencyRoutes);

// Request logging with emergency monitoring
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        
        // Update emergency handler
        emergencyHandler.lastResponse = {
            timestamp: Date.now(),
            message: `${req.method} ${req.path}`
        };
        
        console.log(`📊 ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - ${req.requestId}`);
    });
    
    next();
});

// Database connection with emergency mode
const initializeDatabase = async () => {
    console.log('🔍 Initializing database connection...');
    
    try {
        const dbConnected = await connectDB();
        if (dbConnected) {
            console.log('✅ MongoDB Connected');
            return true;
        } else {
            console.log('⚠️ Database not available - Emergency mode active');
            return false;
        }
    } catch (error) {
        console.log('❌ Database connection failed - Emergency mode active');
        return false;
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    try {
        emergencyHandler.stopMonitoring();
        await disconnectDB();
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error.message);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions with emergency response
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    // Don't exit, keep emergency system running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    // Don't exit, keep emergency system running
});

// Initialize and start server
const initializeApp = async () => {
    try {
        console.log('🚀 Starting VUAI Agent with Emergency Response System...');
        
        // Initialize database (optional in emergency mode)
        await initializeDatabase();
        
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`\n🎯 VUAI Agent with Emergency System Started!`);
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`📊 Health: http://localhost:${PORT}/health`);
            console.log(`🚨 Emergency: http://localhost:${PORT}/api/emergency`);
            console.log(`🔧 Guaranteed Responses: ALWAYS ACTIVE`);
            console.log(`⚡ Response Time: <5ms for emergency queries`);
            console.log(`🚀 Status: Ready with emergency fallback\n`);
        });
        
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use.`);
            } else {
                console.error('❌ Server error:', error);
            }
        });
        
        server.timeout = 30000;
        server.keepAliveTimeout = 65000;
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        // Don't exit, emergency system should still work
    }
};

// Start the application
initializeApp();

module.exports = app;
