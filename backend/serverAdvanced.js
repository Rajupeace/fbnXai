// Enhanced VUAI Agent with Advanced Features
require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const chokidar = require('chokidar');
const { DASHBOARD_PATHS, RESOURCE_MAP } = require('./dashboardConfig');
const dbFile = require('./dbHelper');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const multer = require('multer');
const { connectDB, connectDBWithMonitoring, disconnectDB } = require('./config/database');
const jwt = require('jsonwebtoken');

// Import Mongoose Models
const Admin = require('./models/Admin');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Message = require('./models/Message');
const materialController = require('./controllers/materialController');

// Import Ultra-Fast Response System
const UltraFastResponse = require('./utils/ultraFastResponse');

const app = express();

// Initialize ultra-fast response engine
const ultraFastResponse = new UltraFastResponse();

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
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

// Security and performance middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));

app.use(compression());
app.use(express.json({ limit: process.env.BODY_LIMIT || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enhanced rate limiting with different limits for different endpoints
const createRateLimit = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
    }
});

// Different rate limits for different endpoints
const generalLimiter = createRateLimit(
    Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    Number(process.env.RATE_LIMIT_MAX || 200),
    'Please try again later'
);

const apiLimiter = createRateLimit(
    60_000,
    100,
    'API rate limit exceeded'
);

const ultraFastLimiter = createRateLimit(
    60_000,
    1000,
    'Ultra-fast rate limit exceeded'
);

app.use(generalLimiter);

// Connection monitoring and health check
let serverInstance = null;
let isShuttingDown = false;
let metrics = {
    requests: 0,
    errors: 0,
    startTime: Date.now(),
    ultraFastResponses: 0,
    databaseQueries: 0
};

// Enhanced health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        database: {
            status: statusMap[dbStatus] || 'unknown',
            readyState: dbStatus,
            host: mongoose.connection.host,
            name: mongoose.connection.name
        },
        server: {
            uptime,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            version: process.version,
            platform: process.platform,
            arch: process.arch
        },
        metrics: {
            totalRequests: metrics.requests,
            totalErrors: metrics.errors,
            ultraFastResponses: metrics.ultraFastResponses,
            databaseQueries: metrics.databaseQueries,
            averageResponseTime: metrics.requests > 0 ? 
                (metrics.totalResponseTime / metrics.requests).toFixed(2) + 'ms' : '0ms'
        },
        performance: {
            ultraFastEngine: ultraFastResponse.getMetrics()
        }
    });
});

// Ultra-fast response endpoint
app.post('/api/ultra-fast', ultraFastLimiter, (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    try {
        const result = ultraFastResponse.getUltraFastResponse(message, context);
        
        metrics.ultraFastResponses++;
        metrics.totalResponseTime = (metrics.totalResponseTime || 0) + (Date.now() - startTime);
        
        res.json({
            response: result.response,
            responseTime: result.responseTime,
            source: result.source,
            cached: result.cached,
            requestId: req.requestId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        metrics.errors++;
        res.status(500).json({
            error: 'Ultra-fast response failed',
            message: error.message,
            requestId: req.requestId
        });
    }
});

// Performance metrics endpoint
app.get('/api/metrics', apiLimiter, (req, res) => {
    res.json({
        metrics: metrics,
        ultraFast: ultraFastResponse.getMetrics(),
        timestamp: new Date().toISOString(),
        requestId: req.requestId
    });
});

// Request logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    metrics.requests++;
    
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        metrics.totalResponseTime = (metrics.totalResponseTime || 0) + responseTime;
        
        console.log(`📊 ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - ${req.requestId}`);
    });
    
    next();
});

// Enhanced database connection with retry logic
const initializeDatabase = async () => {
    console.log('🔍 Initializing database connection...');
    
    try {
        const dbConnected = await connectDB();
        if (!dbConnected) {
            console.error('❌ CRITICAL: MongoDB connection failed. Retrying...');
            let retryCount = 0;
            const maxRetries = 5;
            
            while (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`⏳ Retrying database connection in ${delay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                const retryConnected = await connectDB();
                
                if (retryConnected) {
                    console.log('✅ Database connection successful after retry!');
                    break;
                }
                
                retryCount++;
            }
            
            if (retryCount >= maxRetries) {
                console.error('❌ All database connection attempts failed. Starting in degraded mode...');
                return false;
            }
        } else {
            console.log('✅ MongoDB is CONNECTED - Source of Truth for All Data');
        }
        
        // Set up connection monitoring
        mongoose.connection.on('connected', () => {
            console.log('🔗 MongoDB connection established');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
            metrics.errors++;
            if (!isShuttingDown) {
                console.log('🔄 Attempting to reconnect...');
                setTimeout(initializeDatabase, 5000);
            }
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB disconnected');
            if (!isShuttingDown) {
                console.log('🔄 Attempting to reconnect...');
                setTimeout(initializeDatabase, 5000);
            }
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        metrics.errors++;
        return false;
    }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
        console.log('⏳ Shutdown already in progress...');
        return;
    }
    
    isShuttingDown = true;
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    try {
        if (serverInstance) {
            serverInstance.close(() => {
                console.log('🔌 HTTP server closed');
            });
        }
        
        await disconnectDB();
        console.log('🔌 Database connection closed');
        
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
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    metrics.errors++;
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    metrics.errors++;
    gracefulShutdown('unhandledRejection');
});

// Load routes
const chatRoutes = require('./routes/chat');
const ultraFastRoutes = require('./routes/ultraFast');

// Apply routes with rate limiting
app.use('/api/chat', apiLimiter, chatRoutes);
app.use('/api/ultra-fast', ultraFastLimiter, ultraFastRoutes);

// Initialize and start server
const initializeApp = async () => {
    try {
        console.log('🚀 Starting Enhanced VUAI Agent Server...');
        
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.log('⚠️ Database not available. Starting in degraded mode...');
        }
        
        if (mongoose.connection.readyState === 1) {
            try {
                console.log('📊 Ensuring MongoDB indexes...');
                await Promise.all([
                    typeof Admin?.createIndexes === 'function' ? Admin.createIndexes() : Promise.resolve(),
                    typeof Student?.createIndexes === 'function' ? Student.createIndexes() : Promise.resolve(),
                    typeof Faculty?.createIndexes === 'function' ? Faculty.createIndexes() : Promise.resolve(),
                    typeof Course?.createIndexes === 'function' ? Course.createIndexes() : Promise.resolve(),
                    typeof Message?.createIndexes === 'function' ? Message.createIndexes() : Promise.resolve()
                ]);
                console.log('✅ Database indexes ensured');
            } catch (indexError) {
                console.warn('⚠️ Index creation warning:', indexError.message);
            }
        }
        
        const PORT = process.env.PORT || 5000;
        serverInstance = app.listen(PORT, () => {
            console.log(`\n🎯 Enhanced VUAI Agent Server Started Successfully!`);
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`📊 Health Check: http://localhost:${PORT}/health`);
            console.log(`🔧 Metrics: http://localhost:${PORT}/api/metrics`);
            console.log(`⚡ Ultra-Fast API: http://localhost:${PORT}/api/ultra-fast`);
            console.log(`🔌 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
            console.log(`🚀 Status: Ready for requests`);
            console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
        });
        
        serverInstance.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });
        
        serverInstance.timeout = 30000;
        serverInstance.keepAliveTimeout = 65000;
        serverInstance.headersTimeout = 66000;
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

initializeApp();

module.exports = app;
