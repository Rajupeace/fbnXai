// Simple Fast Response Server
const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Fast response data
const fastResponses = {
    hello: "🌟 Hello! I'm your VUAI Agent, ready to help you instantly!",
    help: "🚨 Help Available! I can assist with studies, technical issues, and provide fast answers!",
    urgent: "🚨 URGENT MODE - I'm responding instantly! What do you need?",
    calculate: "🧮 Math Calculator Ready! Try: calculate 5+3, calculate 10*2, etc.",
    status: "📊 System Status: All systems operational and ready to assist!",
    thanks: "🌟 You're welcome! Always here to help!",
    bye: "👋 Goodbye! I'll be here when you need me!"
};

// Math calculation function
const calculateMath = (expression) => {
    const match = expression.match(/calculate\s+(.+)/i);
    if (!match) return null;
    
    const expr = match[1];
    
    // Simple math operations
    if (expr.includes('+')) {
        const parts = expr.split('+');
        const result = parseFloat(parts[0]) + parseFloat(parts[1]);
        return `🧮 ${expr} = ${result}`;
    }
    
    if (expr.includes('*')) {
        const parts = expr.split('*');
        const result = parseFloat(parts[0]) * parseFloat(parts[1]);
        return `🧮 ${expr} = ${result}`;
    }
    
    if (expr.includes('-')) {
        const parts = expr.split('-');
        const result = parseFloat(parts[0]) - parseFloat(parts[1]);
        return `🧮 ${expr} = ${result}`;
    }
    
    if (expr.includes('/')) {
        const parts = expr.split('/');
        const result = parseFloat(parts[0]) / parseFloat(parts[1]);
        return `🧮 ${expr} = ${result.toFixed(2)}`;
    }
    
    return null;
};

// Fast response endpoint
app.post('/api/fast', (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    let response;
    const lowerMessage = message.toLowerCase();
    
    // Check for math calculations
    const mathResult = calculateMath(message);
    if (mathResult) {
        response = mathResult;
    } else {
        // Check for fast responses
        for (const [key, value] of Object.entries(fastResponses)) {
            if (lowerMessage.includes(key)) {
                response = value;
                break;
            }
        }
    }
    
    // Default response
    if (!response) {
        response = "🚨 Fast Response: I'm here to help instantly! Ask me anything and I'll respond quickly!";
    }
    
    const responseTime = Date.now() - startTime;
    
    res.json({
        response,
        responseTime,
        source: 'fast-response-server',
        enhanced: true,
        guaranteed: true,
        timestamp: Date.now()
    });
});

// Emergency response endpoint
app.post('/api/emergency', (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    let response;
    const lowerMessage = message.toLowerCase();
    
    // Emergency responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = "🌟 Emergency Response: Hello! I'm here to help instantly!";
    } else if (lowerMessage.includes('help')) {
        response = "🚨 Emergency Help Available! I can assist with any questions immediately!";
    } else if (lowerMessage.includes('urgent')) {
        response = "🚨 URGENT MODE - I'm responding instantly! What do you need?";
    } else {
        response = "🚨 Emergency Response: I'm here to help! Ask me anything and I'll respond instantly!";
    }
    
    const responseTime = Date.now() - startTime;
    
    res.json({
        response,
        responseTime,
        source: 'emergency-system',
        emergency: true,
        guaranteed: true,
        timestamp: Date.now()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        server: 'fast-response-server',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        features: {
            fastResponses: true,
            emergencyResponses: true,
            mathCalculations: true,
            guaranteedResponses: true
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'VUAI Agent Fast Response Server',
        status: 'running',
        endpoints: {
            fast: '/api/fast',
            emergency: '/api/emergency',
            health: '/health'
        },
        features: [
            'Ultra-fast responses',
            'Emergency fallback system',
            'Math calculations',
            'Guaranteed responses'
        ]
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 VUAI Agent Fast Response Server Started!`);
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`⚡ Fast API: http://localhost:${PORT}/api/fast`);
    console.log(`🚨 Emergency API: http://localhost:${PORT}/api/emergency`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log(`⏱️ Started at: ${new Date().toISOString()}`);
    console.log(`🎯 Status: Ready for fast responses!\n`);
});

module.exports = app;
