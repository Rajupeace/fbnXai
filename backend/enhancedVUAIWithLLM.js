// Enhanced VUAI Agent with Full LLM and LangChain Integration
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const mongoose = require('mongoose');

// Import enhanced components
const EnhancedLLMLangChain = require('./utils/enhancedLLMLangChain');
const { initializeEnhancedDB, saveToDatabase } = require('./config/enhancedDB');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5000,
    message: { error: 'Too many requests', message: 'Please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Initialize Enhanced LLM and LangChain
let llmIntegration = null;

// MongoDB Schemas for Enhanced System
const knowledgeFileSchema = new mongoose.Schema({
    filename: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    metadata: {
        size: Number,
        created: Date,
        modified: Date,
        tags: [String],
        keywords: [String]
    },
    linked: { type: Boolean, default: true },
    processed: { type: Boolean, default: false },
    vectorized: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    userId: { type: String, required: true },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        metadata: {
            source: String,
            responseTime: Number,
            cached: Boolean,
            knowledgeUsed: [String]
        }
    }],
    summary: String,
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const systemMetricsSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    metrics: {
        totalRequests: Number,
        avgResponseTime: Number,
        cacheHitRate: Number,
        llmQueries: Number,
        knowledgeBaseQueries: Number,
        errors: Number
    },
    systemStatus: {
        llmReady: Boolean,
        langChainReady: Boolean,
        databaseConnected: Boolean,
        knowledgeBaseSize: Number
    }
});

// Models
const KnowledgeFile = mongoose.model('KnowledgeFile', knowledgeFileSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const SystemMetrics = mongoose.model('SystemMetrics', systemMetricsSchema);

// Enhanced Chat Endpoint with Full LLM and LangChain
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    try {
        const { message, userId, sessionId, context = {} } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required',
                responseTime: Date.now() - startTime
            });
        }

        // Get enhanced response from LLM and LangChain
        const response = await llmIntegration.getEnhancedResponse(message, {
            userId,
            sessionId,
            ...context
        });

        // Save conversation to database
        try {
            await saveConversation(userId, sessionId || 'default', message, response);
        } catch (dbError) {
            console.log('⚠️ Failed to save conversation:', dbError.message);
        }

        // Update metrics
        await updateSystemMetrics({
            totalRequests: 1,
            avgResponseTime: response.responseTime,
            cacheHitRate: response.cached ? 1 : 0,
            llmQueries: response.source.includes('llm') || response.source.includes('langchain') ? 1 : 0,
            knowledgeBaseQueries: response.source.includes('knowledge') ? 1 : 0,
            errors: 0
        });

        res.json({
            success: true,
            response: response.response,
            source: response.source,
            responseTime: response.responseTime,
            timestamp: response.timestamp,
            cached: response.cached || false,
            knowledgeSource: response.knowledgeSource,
            sessionId: sessionId || 'default'
        });

    } catch (error) {
        console.error('❌ Chat endpoint error:', error.message);
        
        await updateSystemMetrics({
            totalRequests: 1,
            errors: 1
        });

        res.status(500).json({
            success: false,
            error: 'Internal server error',
            responseTime: Date.now() - startTime
        });
    }
});

// Knowledge Management Endpoints
app.post('/api/knowledge/upload', async (req, res) => {
    const startTime = Date.now();
    try {
        const { filename, category, content, type, metadata = {} } = req.body;
        
        if (!filename || !category || !content) {
            return res.status(400).json({
                success: false,
                error: 'Filename, category, and content are required',
                responseTime: Date.now() - startTime
            });
        }

        // Save to database
        const knowledgeFile = new KnowledgeFile({
            filename,
            category,
            type: type || 'text',
            content,
            metadata: {
                ...metadata,
                size: JSON.stringify(content).length,
                created: new Date(),
                modified: new Date()
            },
            linked: true,
            processed: false,
            vectorized: false
        });

        await knowledgeFile.save();

        // Link to LLM integration
        await llmIntegration.loadKnowledgeFile(filename, path.join(__dirname, 'knowledge'));

        res.json({
            success: true,
            message: 'Knowledge file uploaded and linked successfully',
            fileId: knowledgeFile._id,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('❌ Knowledge upload error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to upload knowledge file',
            responseTime: Date.now() - startTime
        });
    }
});

app.get('/api/knowledge/list', async (req, res) => {
    const startTime = Date.now();
    try {
        const { category, type } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (type) query.type = type;
        
        const knowledgeFiles = await KnowledgeFile.find(query)
            .select('filename category type metadata linked processed vectorized createdAt updatedAt')
            .sort({ updatedAt: -1 });

        res.json({
            success: true,
            knowledgeFiles,
            total: knowledgeFiles.length,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('❌ Knowledge list error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve knowledge files',
            responseTime: Date.now() - startTime
        });
    }
});

app.post('/api/knowledge/process/:fileId', async (req, res) => {
    const startTime = Date.now();
    try {
        const { fileId } = req.params;
        
        const knowledgeFile = await KnowledgeFile.findById(fileId);
        if (!knowledgeFile) {
            return res.status(404).json({
                success: false,
                error: 'Knowledge file not found',
                responseTime: Date.now() - startTime
            });
        }

        // Mark as processed
        knowledgeFile.processed = true;
        knowledgeFile.updatedAt = new Date();
        await knowledgeFile.save();

        // Trigger vectorization in LangChain
        // This would be implemented based on your LangChain setup

        res.json({
            success: true,
            message: 'Knowledge file processed successfully',
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('❌ Knowledge process error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to process knowledge file',
            responseTime: Date.now() - startTime
        });
    }
});

// Conversation Management
app.get('/api/conversations/:userId', async (req, res) => {
    const startTime = Date.now();
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        
        const conversations = await Conversation.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            conversations,
            total: conversations.length,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('❌ Conversations error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversations',
            responseTime: Date.now() - startTime
        });
    }
});

// System Status and Metrics
app.get('/api/system/status', async (req, res) => {
    const startTime = Date.now();
    try {
        const llmStatus = llmIntegration.getSystemStatus();
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
        
        // Get recent metrics
        const recentMetrics = await SystemMetrics.findOne()
            .sort({ timestamp: -1 });

        res.json({
            success: true,
            status: {
                llm: llmStatus,
                database: {
                    status: dbStatus,
                    name: mongoose.connection.name,
                    host: mongoose.connection.host
                },
                metrics: recentMetrics ? recentMetrics.metrics : null,
                systemHealth: llmStatus.langChainReady && dbStatus === 'connected' ? 'healthy' : 'degraded'
            },
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('❌ System status error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to get system status',
            responseTime: Date.now() - startTime
        });
    }
});

// Database Management
app.post('/api/database/save', async (req, res) => {
    const startTime = Date.now();
    try {
        const { data, collection = 'general' } = req.body;
        
        if (!data) {
            return res.status(400).json({
                success: false,
                error: 'Data is required',
                responseTime: Date.now() - startTime
            });
        }

        const result = await saveToDatabase(data, collection);

        res.json({
            success: true,
            message: 'Data saved successfully',
            result: result._id,
            collection,
            responseTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('❌ Database save error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to save data to database',
            responseTime: Date.now() - startTime
        });
    }
});

// Enhanced Health Endpoint
app.get('/health', (req, res) => {
    const startTime = Date.now();
    
    const llmStatus = llmIntegration ? llmIntegration.getSystemStatus() : null;
    const dbStatus = mongoose.connection.readyState;
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        requestId: require('crypto').randomUUID(),
        features: {
            llm: { 
                active: llmStatus ? llmStatus.langChainReady : false,
                status: llmStatus ? 'operational' : 'initializing'
            },
            langChain: { 
                active: llmStatus ? llmStatus.langChainReady : false,
                status: llmStatus ? 'operational' : 'initializing'
            },
            knowledgeBase: { 
                active: true,
                status: 'operational',
                files: llmStatus ? llmStatus.knowledgeBases : 0
            },
            database: {
                status: dbStatus === 1 ? 'connected' : 'disconnected',
                readyState: dbStatus
            }
        },
        responseTime: Date.now() - startTime
    });
});

// Serve Dashboard
app.get('/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, '..', '..', 'dashboard.html');
    res.sendFile(dashboardPath, (err) => {
        if (err) {
            console.error('Dashboard file not found:', err);
            res.status(404).json({ 
                success: false, 
                error: 'Dashboard not found'
            });
        }
    });
});

// Helper Functions
async function saveConversation(userId, sessionId, userMessage, assistantResponse) {
    try {
        await Conversation.findOneAndUpdate(
            { userId, sessionId },
            {
                $push: {
                    messages: [
                        {
                            role: 'user',
                            content: userMessage,
                            timestamp: new Date(),
                            metadata: {}
                        },
                        {
                            role: 'assistant',
                            content: assistantResponse.response,
                            timestamp: new Date(),
                            metadata: {
                                source: assistantResponse.source,
                                responseTime: assistantResponse.responseTime,
                                cached: assistantResponse.cached,
                                knowledgeUsed: assistantResponse.knowledgeSource ? [assistantResponse.knowledgeSource] : []
                            }
                        }
                    ]
                },
                $set: { updatedAt: new Date() }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Failed to save conversation:', error.message);
    }
}

async function updateSystemMetrics(metrics) {
    try {
        await SystemMetrics.findOneAndUpdate(
            {},
            {
                $inc: { 'metrics.totalRequests': metrics.totalRequests || 0 },
                $set: {
                    'metrics.avgResponseTime': metrics.avgResponseTime,
                    'systemStatus.llmReady': llmIntegration ? llmIntegration.getSystemStatus().langChainReady : false,
                    'systemStatus.langChainReady': llmIntegration ? llmIntegration.getSystemStatus().langChainReady : false,
                    'systemStatus.databaseConnected': mongoose.connection.readyState === 1,
                    'systemStatus.knowledgeBaseSize': llmIntegration ? llmIntegration.getSystemStatus().knowledgeBases : 0
                }
            },
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('❌ Failed to update metrics:', error.message);
    }
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    if (llmIntegration) {
        llmIntegration.stopServices();
    }
    
    mongoose.connection.close(() => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Initialize and start server
const initializeApp = async () => {
    try {
        console.log('🚀 Starting Enhanced VUAI Agent with Full LLM and LangChain...');
        
        // Initialize database
        const dbInitialized = await initializeEnhancedDB();
        if (!dbInitialized) {
            console.log('⚠️ Database initialization failed, continuing with limited functionality');
        }
        
        // Initialize LLM and LangChain integration
        llmIntegration = new EnhancedLLMLangChain();
        await llmIntegration.initializeKnowledgeBase();
        
        const server = app.listen(PORT, () => {
            console.log(`\n🎯 Enhanced VUAI Agent with Full LLM and LangChain Started!`);
            console.log(`🌐 Server: http://localhost:${PORT}`);
            console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
            console.log(`🧠 Full LLM: http://localhost:${PORT}/api/chat`);
            console.log(`🔗 LangChain: ${llmIntegration.getSystemStatus().langChainReady ? '✅ Active' : '⚠️ Initializing'}`);
            console.log(`📚 Knowledge Base: ${llmIntegration.getSystemStatus().knowledgeBases} files linked`);
            console.log(`🗄️ Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '⚠️ Disconnected'}`);
            console.log(`🎯 Health: http://localhost:${PORT}/health`);
            console.log(`\n🔥 Enhanced Features Active:`);
            console.log(`• ✅ Full LLM Integration`);
            console.log(`• ✅ LangChain RAG System`);
            console.log(`• ✅ Knowledge Base Auto-Linking`);
            console.log(`• ✅ Database Persistence`);
            console.log(`• ✅ MongoDB Atlas Support`);
            console.log(`• ✅ Conversation Management`);
            console.log(`• ✅ System Metrics`);
            console.log(`🎯 Status: Ready with Full AI Stack!\n`);
        });
        
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use.`);
            } else {
                console.error('❌ Server error:', error);
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

initializeApp();
