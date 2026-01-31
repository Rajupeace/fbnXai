// Emergency Fast Response System - Always Responds
const EmergencyFastResponse = require('./emergencyFastResponse');

class EmergencyResponseHandler {
    constructor() {
        this.emergencyFastResponse = new EmergencyFastResponse();
        this.lastResponse = null;
        this.responseCache = new Map();
        this.isHealthy = true;
        this.healthCheckInterval = null;
        this.startHealthMonitoring();
    }

    // Start health monitoring
    startHealthMonitoring() {
        this.healthCheckInterval = setInterval(() => {
            this.checkSystemHealth();
        }, 5000); // Check every 5 seconds
    }

    // Check system health
    checkSystemHealth() {
        const now = Date.now();
        const wasHealthy = this.isHealthy;
        
        // Check if system is responding
        this.isHealthy = this.lastResponse && (now - this.lastResponse.timestamp < 10000);
        
        if (!this.isHealthy && wasHealthy) {
            console.log('🚨 System health degraded - Activating emergency response');
        } else if (this.isHealthy && !wasHealthy) {
            console.log('✅ System health restored');
        }
    }

    // Get emergency response - ALWAYS returns something
    getEmergencyResponse(message, context = {}) {
        const now = Date.now();
        this.lastResponse = { timestamp: now, message: message || '' };
        
        // Check cache first
        const cacheKey = (message || '').toLowerCase().trim();
        if (this.responseCache.has(cacheKey)) {
            const cached = this.responseCache.get(cacheKey);
            console.log('⚡ Emergency cache hit');
            return {
                response: cached.response,
                source: 'emergency-cache',
                responseTime: 1,
                timestamp: now,
                emergency: true
            };
        }

        // Get emergency fast response
        const emergencyResponse = this.emergencyFastResponse.getUltraFastResponse(message || '', context);
        
        // Cache the response
        this.responseCache.set(cacheKey, emergencyResponse);
        
        // Limit cache size
        if (this.responseCache.size > 1000) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }

        return {
            response: emergencyResponse.response,
            source: 'emergency-system',
            responseTime: emergencyResponse.responseTime || 2,
            timestamp: now,
            emergency: true,
            healthStatus: this.isHealthy ? 'healthy' : 'emergency-mode'
        };
    }

    // Get system status
    getSystemStatus() {
        return {
            isHealthy: this.isHealthy,
            lastResponse: this.lastResponse,
            cacheSize: this.responseCache.size,
            emergencyPatterns: this.emergencyFastResponse.getPatterns().length,
            timestamp: Date.now()
        };
    }

    // Clear cache
    clearCache() {
        this.responseCache.clear();
        console.log('🧹 Emergency cache cleared');
    }

    // Add emergency pattern
    addEmergencyPattern(keyword, response, priority = 1) {
        this.emergencyFastResponse.addPattern(keyword, response, priority, 1);
        console.log(`➕ Added emergency pattern: ${keyword}`);
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
}

module.exports = EmergencyResponseHandler;
