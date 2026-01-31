// Enhanced Server with Connection Stability and Error Recovery
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

const app = express();

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Security and performance middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: process.env.BODY_LIMIT || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enhanced rate limiting
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: 60
    }
});
app.use(limiter);

// Connection monitoring and health check
let serverInstance = null;
let isShuttingDown = false;

// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
            status: statusMap[dbStatus] || 'unknown',
            readyState: dbStatus
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

// Enhanced database connection with retry logic
const initializeDatabase = async () => {
    console.log('🔍 Initializing database connection...');
    
    try {
        const dbConnected = await connectDB();
        if (!dbConnected) {
            console.error('❌ CRITICAL: MongoDB connection failed. Retrying...');
            // Retry connection with exponential backoff
            let retryCount = 0;
            const maxRetries = 5;
            
            while (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
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
        // Stop accepting new connections
        if (serverInstance) {
            serverInstance.close(() => {
                console.log('🔌 HTTP server closed');
            });
        }
        
        // Close database connection
        await disconnectDB();
        console.log('🔌 Database connection closed');
        
        // Close other resources
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
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

// Initialize and start server
const initializeApp = async () => {
    try {
        console.log('🚀 Starting VUAI Agent Server...');
        
        // Initialize database
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.log('⚠️ Database not available. Starting in degraded mode...');
        }
        
        // Create indexes if database is connected
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
        
        // Start HTTP server
        const PORT = process.env.PORT || 5000;
        serverInstance = app.listen(PORT, () => {
            console.log(`\n🎯 VUAI Agent Server Started Successfully!`);
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`📊 Health Check: http://localhost:${PORT}/health`);
            console.log(`🔌 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
            console.log(`🚀 Status: Ready for requests`);
            console.log(`⏰ Started at: ${new Date().toISOString()}\n`);
        });
        
        // Handle server errors
        serverInstance.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
            } else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });
        
        // Set server timeout
        serverInstance.timeout = 30000; // 30 seconds
        serverInstance.keepAliveTimeout = 65000; // 65 seconds
        serverInstance.headersTimeout = 66000; // 66 seconds
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// Start the application
initializeApp();

module.exports = app;
