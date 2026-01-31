// Enhanced LLM API Routes with Fast Response
const express = require('express');
const router = express.Router();
const EnhancedLLMIntegration = require('../utils/enhancedLLMIntegration');

// Initialize enhanced LLM integration
const llmIntegration = new EnhancedLLMIntegration();

// Start LLM service on module load
llmIntegration.startPythonLLM().then(success => {
    if (success) {
        console.log('✅ Enhanced LLM service started successfully');
    } else {
        console.log('⚠️ Enhanced LLM service in fallback mode');
    }
}).catch(error => {
    console.log('❌ Enhanced LLM service failed to start:', error.message);
});

// Enhanced LLM chat endpoint
router.post('/chat', async (req, res) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    
    try {
        // Get enhanced LLM response
        const llmResponse = await llmIntegration.getLLMResponse(message, context);
        
        res.json({
            response: llmResponse.response,
            source: llmResponse.source,
            responseTime: llmResponse.responseTime,
            timestamp: llmResponse.timestamp,
            cached: llmResponse.cached || false,
            enhanced: true,
            requestId: `llm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        
    } catch (error) {
        console.error('❌ Enhanced LLM chat error:', error.message);
        
        // Fallback response
        res.json({
            response: '🧠 Enhanced AI Response: I\'m experiencing technical difficulties, but I\'m still here to help! Ask me anything and I\'ll do my best to assist you.',
            source: 'llm-fallback',
            responseTime: Date.now() - startTime,
            timestamp: Date.now(),
            enhanced: true,
            error: error.message
        });
    }
});

// Ultra-fast LLM response
router.post('/fast', async (req, res) => {
    const { message, context } = req.body;
    
    try {
        const llmResponse = await llmIntegration.getLLMResponse(message, context);
        
        res.json({
            response: llmResponse.response,
            responseTime: llmResponse.responseTime,
            source: llmResponse.source,
            enhanced: true,
            fast: true
        });
        
    } catch (error) {
        res.json({
            response: '🚨 Fast AI Response: I\'m here to help instantly!',
            responseTime: 5,
            source: 'fast-fallback',
            enhanced: true,
            fast: true
        });
    }
});

// LLM system status
router.get('/status', (req, res) => {
    const status = llmIntegration.getSystemStatus();
    
    res.json({
        ...status,
        enhanced: true,
        timestamp: Date.now(),
        features: {
            pythonLLM: status.pythonLLMReady,
            knowledgeBase: status.knowledgeBases > 0,
            fastResponses: status.fastResponses > 0,
            caching: status.cacheSize >= 0
        }
    });
});

// Clear LLM cache
router.post('/clear-cache', (req, res) => {
    try {
        llmIntegration.clearCache();
        res.json({
            message: 'LLM response cache cleared',
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to clear LLM cache',
            message: error.message
        });
    }
});

// Restart LLM service
router.post('/restart', async (req, res) => {
    try {
        console.log('🔄 Restarting Enhanced LLM service...');
        
        // Stop current service
        llmIntegration.stopPythonLLM();
        
        // Clear cache
        llmIntegration.clearCache();
        
        // Start service again
        const success = await llmIntegration.startPythonLLM();
        
        res.json({
            message: success ? 'LLM service restarted successfully' : 'LLM service restarted in fallback mode',
            success,
            timestamp: Date.now()
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Failed to restart LLM service',
            message: error.message
        });
    }
});

// Test LLM capabilities
router.post('/test', async (req, res) => {
    const testMessages = [
        'hello',
        'help',
        'urgent',
        'what is ohms law',
        'explain circuits',
        'calculate 2+2'
    ];
    
    const results = [];
    
    for (const message of testMessages) {
        try {
            const startTime = Date.now();
            const response = await llmIntegration.getLLMResponse(message);
            const totalTime = Date.now() - startTime;
            
            results.push({
                message,
                response: response.response.substring(0, 100) + '...',
                source: response.source,
                responseTime: response.responseTime,
                totalTime,
                cached: response.cached || false
            });
        } catch (error) {
            results.push({
                message,
                error: error.message,
                responseTime: -1
            });
        }
    }
    
    const avgResponseTime = results
        .filter(r => r.responseTime > 0)
        .reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    res.json({
        testResults: results,
        averageResponseTime: avgResponseTime.toFixed(2),
        totalTests: testMessages.length,
        successfulTests: results.filter(r => !r.error).length,
        timestamp: Date.now()
    });
});

// Knowledge base query
router.post('/knowledge', async (req, res) => {
    const { query, category } = req.body;
    
    try {
        const context = { category, knowledgeQuery: true };
        const response = await llmIntegration.getLLMResponse(query, context);
        
        res.json({
            query,
            response: response.response,
            source: response.source,
            category,
            responseTime: response.responseTime,
            timestamp: response.timestamp
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Knowledge query failed',
            message: error.message
        });
    }
});

// Batch LLM processing
router.post('/batch', async (req, res) => {
    const { messages } = req.body;
    
    if (!Array.isArray(messages)) {
        return res.status(400).json({
            error: 'Messages must be an array'
        });
    }
    
    const results = [];
    
    for (const message of messages) {
        try {
            const response = await llmIntegration.getLLMResponse(message.text, message.context);
            results.push({
                id: message.id,
                response: response.response,
                source: response.source,
                responseTime: response.responseTime,
                cached: response.cached || false
            });
        } catch (error) {
            results.push({
                id: message.id,
                error: error.message,
                responseTime: -1
            });
        }
    }
    
    res.json({
        results,
        totalMessages: messages.length,
        successfulMessages: results.filter(r => !r.error).length,
        timestamp: Date.now()
    });
});

module.exports = router;
