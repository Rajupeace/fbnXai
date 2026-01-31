// Ultra-Fast API Endpoints - <50ms Response Time
const express = require('express');
const router = express.Router();

// Import ultra-fast response engine
const UltraFastResponse = require('../utils/ultraFastResponse');

// Initialize ultra-fast response engine
const ultraFastResponse = new UltraFastResponse();

// Ultra-fast endpoint - responds in under 20ms
router.post('/ultra-fast', (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    // Get ultra-fast response
    const result = ultraFastResponse.getUltraFastResponse(message, context);
    
    res.json({
        response: result.response,
        responseTime: result.responseTime,
        source: result.source,
        cached: result.cached,
        totalResponseTime: Date.now() - startTime
    });
});

// Instant math calculation endpoint
router.post('/calculate', (req, res) => {
    const startTime = Date.now();
    const { expression } = req.body;
    
    // Simple math calculations
    const result = ultraFastResponse.quickMathCalculation(expression);
    
    res.json({
        result: result || 'Invalid expression',
        responseTime: Date.now() - startTime,
        source: 'math-calculation'
    });
});

// Formula lookup endpoint
router.post('/formula', (req, res) => {
    const startTime = Date.now();
    const { topic } = req.body;
    
    // Formula lookup
    const lowerTopic = topic.toLowerCase();
    const formulas = {
        'ohms law': 'V = I × R, I = V/R, R = V/I',
        'power': 'P = V × I = I²R = V²/R',
        'kirchhoff': 'KCL: ΣI = 0, KVL: ΣV = 0',
        'pid': 'u(t) = Kp×e(t) + Ki×∫e(t)dt + Kd×de/dt',
        'quadratic': 'x = (-b ± √(b²-4ac))/2a',
        'area': 'Circle: πr², Rectangle: l×w, Triangle: ½×b×h',
        'volume': 'Sphere: (4/3)πr³, Cube: l×w×h, Cylinder: πr²h'
    };
    
    const formula = formulas[lowerTopic] || 'Formula not found';
    
    res.json({
        formula,
        topic,
        responseTime: Date.now() - startTime,
        source: 'formula-lookup'
    });
});

// Quick help endpoint
router.post('/help', (req, res) => {
    const startTime = Date.now();
    const { type } = req.body;
    
    const helpResponses = {
        'urgent': '🚨 Urgent help available! What do you need immediately?',
        'study': '📚 Study help ready! Ask about specific topics.',
        'assignment': '📝 Assignment help ready! Describe your task.',
        'exam': '📚 Exam preparation tips available!',
        'technical': '🔧 Technical troubleshooting help available!'
    };
    
    const response = helpResponses[type] || 'How can I help you?';
    
    res.json({
        response,
        type,
        responseTime: Date.now() - startTime,
        source: 'quick-help'
    });
});

// Performance metrics endpoint
router.get('/metrics', (req, res) => {
    const metrics = ultraFastResponse.getMetrics();
    
    res.json({
        ...metrics,
        timestamp: new Date().toISOString(),
        status: 'ultra-fast-system-active'
    });
});

// Clear cache endpoint
router.post('/clear-cache', (req, res) => {
    ultraFastResponse.clearCache();
    
    res.json({
        message: 'Ultra-fast response cache cleared',
        timestamp: new Date().toISOString()
    });
});

// Add pattern endpoint
router.post('/add-pattern', (req, res) => {
    const { keyword, response, priority, responseTime } = req.body;
    
    ultraFastResponse.addPattern(keyword, response, priority, responseTime);
    
    res.json({
        message: `Pattern added: ${keyword}`,
        keyword,
        response,
        priority,
        responseTime,
        timestamp: new Date().toISOString()
    });
});

// Remove pattern endpoint
router.post('/remove-pattern', (req, res) => {
    const { keyword } = req.body;
    
    ultraFastResponse.removePattern(keyword);
    
    res.json({
        message: `Pattern removed: ${keyword}`,
        keyword,
        timestamp: new Date().toISOString()
    });
});

// Get all patterns endpoint
router.get('/patterns', (req, res) => {
    const patterns = ultraFastResponse.getPatterns();
    
    res.json({
        patterns,
        count: Object.keys(patterns).length,
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        system: 'ultra-fast-response',
        responseTime: '< 50ms',
        features: [
            'Ultra-fast responses',
            'Pattern matching',
            'Math calculations',
            'Formula lookup',
            'Quick help',
            'Performance metrics'
        ],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
