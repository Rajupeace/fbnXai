// Emergency Response API - Always Responds
const express = require('express');
const router = express.Router();
const EmergencyResponseHandler = require('../utils/emergencyResponseHandler');

// Initialize emergency response handler
const emergencyHandler = new EmergencyResponseHandler();

// Emergency response endpoint - ALWAYS responds
router.post('/emergency', (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    try {
        // Get emergency response - guaranteed to return something
        const emergencyResponse = emergencyHandler.getEmergencyResponse(message, context);
        
        res.json({
            response: emergencyResponse.response,
            source: emergencyResponse.source,
            responseTime: emergencyResponse.responseTime,
            timestamp: emergencyResponse.timestamp,
            emergency: emergencyResponse.emergency,
            healthStatus: emergencyResponse.healthStatus,
            guaranteed: true,
            requestId: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        
    } catch (error) {
        // Even if everything fails, return a basic response
        res.json({
            response: '🚨 Emergency System Active! I\'m here to help. Try "help" for assistance.',
            source: 'emergency-fallback',
            responseTime: Date.now() - startTime,
            timestamp: Date.now(),
            emergency: true,
            guaranteed: true,
            error: error.message
        });
    }
});

// Ultra-fast emergency response
router.post('/ultra-fast', (req, res) => {
    const { message, context } = req.body;
    
    try {
        const emergencyResponse = emergencyHandler.getEmergencyResponse(message, context);
        
        res.json({
            response: emergencyResponse.response,
            responseTime: emergencyResponse.responseTime,
            source: emergencyResponse.source,
            emergency: true,
            guaranteed: true
        });
        
    } catch (error) {
        res.json({
            response: '⚡ Ultra-fast emergency response!',
            responseTime: 1,
            source: 'ultra-emergency',
            emergency: true,
            guaranteed: true
        });
    }
});

// Emergency system status
router.get('/status', (req, res) => {
    const status = emergencyHandler.getSystemStatus();
    
    res.json({
        ...status,
        emergencySystem: 'active',
        guaranteedResponses: true,
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// Add emergency pattern
router.post('/add-pattern', (req, res) => {
    const { keyword, response, priority } = req.body;
    
    try {
        emergencyHandler.addEmergencyPattern(keyword, response, priority);
        res.json({
            message: `Emergency pattern added: ${keyword}`,
            keyword,
            response,
            priority,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to add emergency pattern',
            message: error.message
        });
    }
});

// Clear emergency cache
router.post('/clear-cache', (req, res) => {
    try {
        emergencyHandler.clearCache();
        res.json({
            message: 'Emergency cache cleared',
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to clear emergency cache',
            message: error.message
        });
    }
});

// Emergency health check
router.get('/health', (req, res) => {
    const status = emergencyHandler.getSystemStatus();
    
    res.json({
        status: 'emergency-ready',
        emergencySystem: 'active',
        guaranteedResponses: true,
        systemHealth: status.isHealthy ? 'healthy' : 'emergency-mode',
        cacheSize: status.cacheSize,
        patternsCount: status.emergencyPatterns,
        timestamp: Date.now()
    });
});

// Test emergency responses
router.post('/test', (req, res) => {
    const testMessages = [
        'hello',
        'help',
        'urgent',
        'calculate 2+2',
        'status',
        'error',
        'study',
        'exam'
    ];
    
    const results = testMessages.map(message => {
        const response = emergencyHandler.getEmergencyResponse(message);
        return {
            message,
            response: response.response,
            responseTime: response.responseTime,
            source: response.source
        };
    });
    
    res.json({
        testResults: results,
        averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
        timestamp: Date.now()
    });
});

module.exports = router;
