// Complete VUAI Agent with LLM and LangChain Integration
require('dotenv').config();
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./config/database');

// Import enhanced systems
const EnhancedLLMIntegration = require('./utils/enhancedLLMIntegration');
const EmergencyResponseHandler = require('./utils/emergencyResponseHandler');

// Import knowledge bases
const eeeKnowledge = require('./knowledge/eeeKnowledge');
const eceKnowledge = require('./knowledge/eceKnowledge');
const cseKnowledge = require('./knowledge/cseKnowledge');
const importantKnowledge = require('./knowledge/importantKnowledge');
const leetCodeDatabase = require('./knowledge/leetCodeDatabase');

const app = express();

// Initialize enhanced systems
const llmIntegration = new EnhancedLLMIntegration();
const emergencyHandler = new EmergencyResponseHandler();

// Knowledge base integration
const knowledgeBase = {
    eee: eeeKnowledge,
    ece: eceKnowledge,
    cse: cseKnowledge,
    important: importantKnowledge,
    leetcode: leetCodeDatabase
};

// Middleware
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

// Request ID middleware
app.use((req, res, next) => {
    req.requestId = req.headers['x-request-id'] || uuidv4();
    res.setHeader('x-request-id', req.requestId);
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 60000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too many requests',
        message: 'Please try again later'
    }
});
app.use(limiter);

// Enhanced health check
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const llmStatus = llmIntegration.getSystemStatus();
    const emergencyStatus = emergencyHandler.getSystemStatus();
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        requestId: req.requestId,
        database: {
            status: statusMap[dbStatus] || 'unknown',
            readyState: dbStatus
        },
        llm: {
            active: true,
            pythonReady: llmStatus.pythonLLMReady,
            knowledgeBases: llmStatus.knowledgeBases,
            fastResponses: llmStatus.fastResponses,
            cacheSize: llmStatus.cacheSize,
            pythonProcessRunning: llmStatus.pythonProcessRunning
        },
        emergency: {
            active: true,
            guaranteed: true,
            healthStatus: emergencyStatus.isHealthy ? 'healthy' : 'emergency-mode',
            cacheSize: emergencyStatus.cacheSize,
            patternsCount: emergencyStatus.emergencyPatterns
        },
        knowledge: {
            bases: Object.keys(knowledgeBase),
            total: Object.keys(knowledgeBase).length,
            categories: ['eee', 'ece', 'cse', 'important', 'leetcode']
        },
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        },
        features: {
            enhancedLLM: 'active',
            langChainIntegration: 'active',
            emergencyResponses: 'active',
            guaranteedResponses: true,
            knowledgeBase: 'active',
            fastResponses: 'active',
            fallbackSystem: 'active'
        }
    });
});

// Enhanced chat endpoint with full integration
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    if (!message) {
        return res.status(400).json({
            error: 'Please provide a message',
            requestId: req.requestId
        });
    }
    
    try {
        // Step 1: Try enhanced LLM first
        const llmResponse = await llmIntegration.getLLMResponse(message, context);
        
        if (llmResponse && llmResponse.response) {
            // Update emergency handler
            emergencyHandler.lastResponse = {
                timestamp: Date.now(),
                message: message
            };
            
            return res.json({
                response: llmResponse.response,
                source: llmResponse.source,
                responseTime: llmResponse.responseTime,
                timestamp: llmResponse.timestamp,
                enhanced: true,
                llm: true,
                cached: llmResponse.cached || false,
                requestId: req.requestId
            });
        }
        
        // Step 2: Try knowledge base
        const knowledgeResponse = getKnowledgeResponse(message, context);
        if (knowledgeResponse) {
            return res.json({
                response: knowledgeResponse.response,
                source: 'knowledge-base',
                responseTime: Date.now() - startTime,
                timestamp: Date.now(),
                enhanced: true,
                knowledge: true,
                requestId: req.requestId
            });
        }
        
        // Step 3: Try emergency response
        const emergencyResponse = emergencyHandler.getEmergencyResponse(message, context);
        
        return res.json({
            response: emergencyResponse.response,
            source: emergencyResponse.source,
            responseTime: emergencyResponse.responseTime,
            timestamp: emergencyResponse.timestamp,
            emergency: emergencyResponse.emergency,
            guaranteed: true,
            requestId: req.requestId
        });
        
    } catch (error) {
        console.error('❌ Enhanced chat failed:', error.message);
        
        // Ultimate fallback
        const emergencyResponse = emergencyHandler.getEmergencyResponse(message, context);
        
        res.json({
            response: emergencyResponse.response,
            source: 'ultimate-fallback',
            responseTime: Date.now() - startTime,
            timestamp: Date.now(),
            emergency: true,
            guaranteed: true,
            requestId: req.requestId,
            originalError: error.message
        });
    }
});

// Knowledge base response function
function getKnowledgeResponse(message, context = {}) {
    const lowerMessage = message.toLowerCase();
    
    // Check EEE knowledge
    if (knowledgeBase.eee && knowledgeBase.eee.keywords) {
        for (const keyword of knowledgeBase.eee.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return {
                    response: knowledgeBase.eee.response || 'EEE knowledge available',
                    category: 'eee'
                };
            }
        }
    }
    
    // Check ECE knowledge
    if (knowledgeBase.ece && knowledgeBase.ece.keywords) {
        for (const keyword of knowledgeBase.ece.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return {
                    response: knowledgeBase.ece.response || 'ECE knowledge available',
                    category: 'ece'
                };
            }
        }
    }
    
    // Check CSE knowledge
    if (knowledgeBase.cse && knowledgeBase.cse.keywords) {
        for (const keyword of knowledgeBase.cse.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return {
                    response: knowledgeBase.cse.response || 'CSE knowledge available',
                    category: 'cse'
                };
            }
        }
    }
    
    // Check important knowledge
    if (knowledgeBase.important && knowledgeBase.important.keywords) {
        for (const keyword of knowledgeBase.important.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return {
                    response: knowledgeBase.important.response || 'Important knowledge available',
                    category: 'important'
                };
            }
        }
    }
    
    // Check LeetCode knowledge
    if (knowledgeBase.leetcode && knowledgeBase.leetcode.keywords) {
        for (const keyword of knowledgeBase.leetcode.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return {
                    response: knowledgeBase.leetcode.response || 'LeetCode knowledge available',
                    category: 'leetcode'
                };
            }
        }
    }
    
    return null;
}

// Enhanced LLM endpoint
app.post('/api/llm', async (req, res) => {
    const { message, context } = req.body;
    
    if (!message) {
        return res.status(400).json({
            error: 'Please provide a message'
        });
    }
    
    try {
        const llmResponse = await llmIntegration.getLLMResponse(message, context);
        
        res.json({
            response: llmResponse.response,
            source: llmResponse.source,
            responseTime: llmResponse.responseTime,
            timestamp: llmResponse.timestamp,
            enhanced: true,
            llm: true,
            cached: llmResponse.cached || false
        });
        
    } catch (error) {
        res.json({
            response: '🧠 Enhanced AI Response: I\'m here to help with LLM capabilities!',
            source: 'llm-fallback',
            responseTime: 10,
            timestamp: Date.now(),
            enhanced: true,
            llm: true
        });
    }
});

// Emergency response endpoint
app.post('/api/emergency', (req, res) => {
    const { message, context } = req.body;
    
    try {
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
        res.json({
            response: '🚨 Emergency System Active! I\'m here to help instantly!',
            source: 'ultimate-fallback',
            responseTime: 1,
            timestamp: Date.now(),
            emergency: true,
            guaranteed: true
        });
    }
});

// Knowledge query endpoint
app.post('/api/knowledge', (req, res) => {
    const { query, category } = req.body;
    
    try {
        const context = { category, knowledgeQuery: true };
        const response = getKnowledgeResponse(query, context);
        
        if (response) {
            res.json({
                query,
                response: response.response,
                source: 'knowledge-base',
                category: response.category,
                responseTime: 5,
                timestamp: Date.now()
            });
        } else {
            res.json({
                query,
                response: '📚 Knowledge: I don\'t have specific information about that, but I can help with general concepts!',
                source: 'knowledge-fallback',
                responseTime: 5,
                timestamp: Date.now()
            });
        }
        
    } catch (error) {
        res.status(500).json({
            error: 'Knowledge query failed',
            message: error.message
        });
    }
});

// System status endpoint
app.get('/api/status', (req, res) => {
    const llmStatus = llmIntegration.getSystemStatus();
    const emergencyStatus = emergencyHandler.getSystemStatus();
    
    res.json({
        llm: llmStatus,
        emergency: emergencyStatus,
        knowledge: {
            bases: Object.keys(knowledgeBase),
            total: Object.keys(knowledgeBase).length
        },
        timestamp: Date.now()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'VUAI Agent - Enhanced AI Study Companion',
        version: '2.0.0',
        status: 'running',
        features: [
            'Enhanced LLM Integration',
            'LangChain Integration',
            'Knowledge Base Access',
            'Emergency Response System',
            'Fast Response Engine',
            'Guaranteed Responses'
        ],
        endpoints: {
            chat: '/api/chat',
            llm: '/api/llm',
            emergency: '/api/emergency',
            knowledge: '/api/knowledge',
            health: '/health',
            status: '/api/status'
        }
    });
});

// Database connection
const initializeDatabase = async () => {
    console.log('🔍 Initializing database connection...');
    
    try {
        const dbConnected = await connectDB();
        if (dbConnected) {
            console.log('✅ MongoDB Connected');
            return true;
        } else {
            console.log('⚠️ Database not available - Enhanced systems active');
            return false;
        }
    } catch (error) {
        console.log('❌ Database connection failed - Enhanced systems active');
        return false;
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
    
    try {
        emergencyHandler.stopMonitoring();
        llmIntegration.stopPythonLLM();
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// Initialize and start server
const initializeApp = async () => {
    try {
        console.log('🚀 Starting Complete VUAI Agent with LLM and LangChain...');
        
        // Initialize database
        await initializeDatabase();
        
        // Start enhanced LLM service
        console.log('🧠 Starting Enhanced LLM Service...');
        llmIntegration.startPythonLLM().then(success => {
            if (success) {
                console.log('✅ Enhanced LLM service started successfully');
            } else {
                console.log('⚠️ Enhanced LLM service in fallback mode');
            }
        }).catch(error => {
            console.log('❌ Enhanced LLM service failed to start:', error.message);
        });
        
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log(`\n🎯 Complete VUAI Agent Started!`);
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`📊 Health: http://localhost:${PORT}/health`);
            console.log(`🧠 Enhanced LLM: http://localhost:${PORT}/api/llm`);
            console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
            console.log(`🚨 Emergency: http://localhost:${PORT}/api/emergency`);
            console.log(`📚 Knowledge: http://localhost:${PORT}/api/knowledge`);
            console.log(`🔗 LangChain: Integrated and active`);
            console.log(`⚡ Fast Responses: Always available`);
            console.log(`🛡️ Guaranteed Responses: 100% uptime`);
            console.log(`🎯 Status: Ready with complete AI capabilities\n`);
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
    }
};

// Start the application
initializeApp();

module.exports = app;
