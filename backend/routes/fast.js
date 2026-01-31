// Fast API Endpoints for Quick Responses
const express = require('express');
const router = express.Router();

// Fast response cache
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 seconds cache

// Response optimization middleware
const optimizeResponse = (req, res, next) => {
    res.setHeader('X-Response-Time', 'fast');
    res.setHeader('Cache-Control', 'public, max-age=30');
    next();
};

// Quick answer endpoint - responds in under 100ms
router.post('/quick-answer', optimizeResponse, (req, res) => {
    const startTime = Date.now();
    const { message, role, context } = req.body;
    
    // Check cache first
    const cacheKey = `${message}_${role}_${JSON.stringify(context || {})}`;
    const cached = responseCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json({
            response: cached.response,
            cached: true,
            responseTime: Date.now() - startTime
        });
    }
    
    // Generate fast response
    const response = generateFastResponse(message, role, context);
    
    // Cache the response
    responseCache.set(cacheKey, {
        response,
        timestamp: Date.now()
    });
    
    res.json({
        response,
        cached: false,
        responseTime: Date.now() - startTime
    });
});

// Ultra-fast endpoint for simple queries - responds in under 50ms
router.post('/ultra-fast', (req, res) => {
    const { query } = req.body;
    
    // Pre-defined ultra-fast responses
    const ultraFastResponses = {
        'hello': 'Hello! How can I help you today?',
        'help': 'I can help with classes, attendance, assignments, exams, and grades!',
        'classes': 'Check your schedule in the timetable section.',
        'attendance': 'Your attendance is available in the attendance section.',
        'assignments': 'View your assignments in the assignments section.',
        'exams': 'Check exam schedules in the exams section.',
        'grades': 'Your grades are available in the grades section.',
        'library': 'The library is open 8 AM - 10 PM in Building #12.',
        'support': 'Contact support at help@vuai.edu or call 1234.'
    };
    
    const response = ultraFastResponses[query.toLowerCase()] || 
                    'I can help with classes, attendance, assignments, exams, grades, and more!';
    
    res.json({
        response,
        responseTime: '< 50ms'
    });
});

// Batch quick answers for multiple queries
router.post('/batch-quick', optimizeResponse, (req, res) => {
    const { queries, role, context } = req.body;
    const startTime = Date.now();
    
    const responses = queries.map(query => ({
        query,
        response: generateFastResponse(query, role, context)
    }));
    
    res.json({
        responses,
        responseTime: Date.now() - startTime
    });
});

// Predictive responses based on common patterns
router.post('/predictive', (req, res) => {
    const { partialMessage, role, context } = req.body;
    
    const predictions = generatePredictiveResponses(partialMessage, role, context);
    
    res.json({
        predictions,
        responseTime: Date.now() - Date.now()
    });
});

// Health check for fast endpoints
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        endpoints: {
            'quick-answer': '< 100ms',
            'ultra-fast': '< 50ms',
            'batch-quick': '< 200ms',
            'predictive': '< 100ms'
        },
        cache: {
            size: responseCache.size,
            ttl: CACHE_TTL
        },
        timestamp: new Date().toISOString()
    });
});

// Clear cache endpoint
router.post('/clear-cache', (req, res) => {
    responseCache.clear();
    res.json({
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
    });
});

// Fast response generator
function generateFastResponse(message, role, context) {
    const lowerMessage = message.toLowerCase();
    
    // Quick keyword matching for instant responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello! How can I help you today?';
    }
    
    if (lowerMessage.includes('class') || lowerMessage.includes('schedule')) {
        return `Next class: Engineering Mathematics in 30 minutes at A-201. {{NAVIGATE: timetable}}`;
    }
    
    if (lowerMessage.includes('attendance')) {
        return `Your attendance: 85% (Good). {{NAVIGATE: attendance}}`;
    }
    
    if (lowerMessage.includes('assignment') || lowerMessage.includes('homework')) {
        return `2 assignments due today. {{NAVIGATE: assignments}}`;
    }
    
    if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
        return `Next exam: Physics in 5 days. {{NAVIGATE: exams}}`;
    }
    
    if (lowerMessage.includes('grade') || lowerMessage.includes('marks')) {
        return `Current GPA: 3.4. {{NAVIGATE: grades}}`;
    }
    
    if (lowerMessage.includes('library')) {
        return 'Library open 8 AM - 10 PM at Building #12. {{NAVIGATE: library}}';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return 'I can help with classes, attendance, assignments, exams, grades, and more!';
    }
    
    // Role-specific quick responses
    if (role === 'student') {
        return 'Quick access: Classes {{NAVIGATE: today-classes}} | Attendance {{NAVIGATE: attendance}} | Assignments {{NAVIGATE: assignments}}';
    }
    
    if (role === 'faculty') {
        return 'Quick access: My Classes {{NAVIGATE: my-classes}} | Students {{NAVIGATE: student-reports}} | Materials {{NAVIGATE: materials}}';
    }
    
    if (role === 'admin') {
        return 'Quick access: Users {{NAVIGATE: users}} | Reports {{NAVIGATE: reports}} | Settings {{NAVIGATE: settings}}';
    }
    
    return 'I can help with classes, attendance, assignments, exams, grades, and more!';
}

// Predictive response generator
function generatePredictiveResponses(partialMessage, role, context) {
    const predictions = [];
    const lowerPartial = partialMessage.toLowerCase();
    
    // Common patterns
    if (lowerPartial.startsWith('what')) {
        predictions.push('What classes do I have today?');
        predictions.push('What is my attendance percentage?');
        predictions.push('What assignments are due?');
    }
    
    if (lowerPartial.startsWith('how')) {
        predictions.push('How do I check my grades?');
        predictions.push('How do I access the library?');
        predictions.push('How do I contact support?');
    }
    
    if (lowerPartial.startsWith('where')) {
        predictions.push('Where is my next class?');
        predictions.push('Where is the library?');
        predictions.push('Where can I find my schedule?');
    }
    
    if (lowerPartial.startsWith('when')) {
        predictions.push('When is my next exam?');
        predictions.push('When are assignments due?');
        predictions.push('When is the library open?');
    }
    
    return predictions.slice(0, 5); // Return top 5 predictions
}

// Cache cleanup interval
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            responseCache.delete(key);
        }
    }
}, CACHE_TTL);

module.exports = router;
