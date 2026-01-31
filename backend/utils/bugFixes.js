// Bug Fixes and Performance Improvements for VUAI Agent

// Fix 1: Enhanced Error Handling and Recovery
class ErrorHandler {
    static handle(error, context = 'Unknown') {
        const timestamp = new Date().toISOString();
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.error(`[${timestamp}] [${context}] [${errorId}] Error:`, error.message);
        console.error(`[${timestamp}] [${context}] [${errorId}] Stack:`, error.stack);
        
        // Categorize error for better handling
        const errorCategory = this.categorizeError(error);
        
        return {
            errorId,
            message: this.getUserFriendlyMessage(error, errorCategory),
            category: errorCategory,
            timestamp,
            context
        };
    }
    
    static categorizeError(error) {
        if (error.code === 'ECONNREFUSED') return 'connection_error';
        if (error.code === 'ETIMEDOUT') return 'timeout_error';
        if (error.code === 'ENOENT') return 'file_not_found';
        if (error.code === 'EACCES') return 'permission_error';
        if (error.name === 'ValidationError') return 'validation_error';
        if (error.name === 'CastError') return 'type_error';
        if (error.message.includes('timeout')) return 'timeout_error';
        if (error.message.includes('network')) return 'network_error';
        return 'general_error';
    }
    
    static getUserFriendlyMessage(error, category) {
        const messages = {
            connection_error: 'Connection issue detected. Please check your internet connection and try again.',
            timeout_error: 'Request timed out. The system is taking longer than expected. Please try again.',
            file_not_found: 'Requested resource not found. Please check your request and try again.',
            permission_error: 'Permission denied. You don\'t have access to this resource.',
            validation_error: 'Invalid input provided. Please check your input and try again.',
            type_error: 'Data type mismatch. Please ensure all data is in the correct format.',
            network_error: 'Network issue detected. Please check your connection and try again.',
            general_error: 'An unexpected error occurred. Please try again or contact support if the issue persists.'
        };
        
        return messages[category] || messages.general_error;
    }
}

// Fix 2: Performance Monitoring and Optimization
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            responseTimes: [],
            errorCounts: {},
            requestCounts: 0,
            memoryUsage: [],
            lastCleanup: Date.now()
        };
        this.thresholds = {
            maxResponseTime: 5000, // 5 seconds
            maxMemoryUsage: 0.8, // 80% of available memory
            cleanupInterval: 300000 // 5 minutes
        };
    }
    
    startTimer(requestId) {
        this.metrics[requestId] = {
            startTime: Date.now(),
            memoryBefore: process.memoryUsage()
        };
    }
    
    endTimer(requestId, success = true) {
        if (!this.metrics[requestId]) return;
        
        const endTime = Date.now();
        const responseTime = endTime - this.metrics[requestId].startTime;
        
        this.metrics.responseTimes.push(responseTime);
        this.metrics.requestCounts++;
        
        if (!success) {
            this.metrics.errorCounts[requestId] = (this.metrics.errorCounts[requestId] || 0) + 1;
        }
        
        // Keep only last 100 response times
        if (this.metrics.responseTimes.length > 100) {
            this.metrics.responseTimes.shift();
        }
        
        // Clean up old metrics
        delete this.metrics[requestId];
        
        // Check if performance is degraded
        this.checkPerformance();
    }
    
    checkPerformance() {
        const avgResponseTime = this.getAverageResponseTime();
        const memoryUsage = this.getMemoryUsage();
        
        if (avgResponseTime > this.thresholds.maxResponseTime) {
            console.warn(`[Performance] Average response time (${avgResponseTime}ms) exceeds threshold`);
        }
        
        if (memoryUsage > this.thresholds.maxMemoryUsage) {
            console.warn(`[Performance] Memory usage (${(memoryUsage * 100).toFixed(2)}%) exceeds threshold`);
            this.triggerCleanup();
        }
    }
    
    getAverageResponseTime() {
        if (this.metrics.responseTimes.length === 0) return 0;
        const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
        return sum / this.metrics.responseTimes.length;
    }
    
    getMemoryUsage() {
        const usage = process.memoryUsage();
        const totalMemory = require('os').totalmem();
        return usage.heapUsed / totalMemory;
    }
    
    triggerCleanup() {
        if (Date.now() - this.metrics.lastCleanup < this.thresholds.cleanupInterval) {
            return;
        }
        
        console.log('[Performance] Triggering cleanup...');
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        this.metrics.lastCleanup = Date.now();
    }
    
    getMetrics() {
        return {
            averageResponseTime: this.getAverageResponseTime(),
            totalRequests: this.metrics.requestCounts,
            errorCount: Object.keys(this.metrics.errorCounts).length,
            memoryUsage: this.getMemoryUsage(),
            uptime: process.uptime()
        };
    }
}

// Fix 3: Enhanced Input Validation and Sanitization
class InputValidator {
    static sanitize(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove potential JavaScript
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, 1000); // Limit length
    }
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static validateUserId(userId) {
        if (!userId || typeof userId !== 'string') return false;
        return userId.length >= 3 && userId.length <= 50 && /^[a-zA-Z0-9_-]+$/.test(userId);
    }
    
    static validateMessage(message) {
        if (!message || typeof message !== 'string') return false;
        const sanitized = this.sanitize(message);
        return sanitized.length >= 1 && sanitized.length <= 1000;
    }
    
    static validateRole(role) {
        const validRoles = ['student', 'faculty', 'admin'];
        return validRoles.includes(role);
    }
    
    static validateBranch(branch) {
        const validBranches = ['eee', 'ece', 'aiml', 'cse', 'civil'];
        return validBranches.includes(branch?.toLowerCase());
    }
}

// Fix 4: Enhanced Rate Limiting
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 60000; // 1 minute
        this.maxRequests = 100; // 100 requests per minute
    }
    
    isAllowed(clientId) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.requests.has(clientId)) {
            this.requests.set(clientId, []);
        }
        
        const clientRequests = this.requests.get(clientId);
        
        // Remove old requests outside the window
        const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
        this.requests.set(clientId, validRequests);
        
        // Check if under the limit
        if (validRequests.length < this.maxRequests) {
            validRequests.push(now);
            return true;
        }
        
        return false;
    }
    
    getRemainingRequests(clientId) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        if (!this.requests.has(clientId)) {
            return this.maxRequests;
        }
        
        const clientRequests = this.requests.get(clientId);
        const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
        
        return Math.max(0, this.maxRequests - validRequests.length);
    }
    
    getResetTime(clientId) {
        if (!this.requests.has(clientId)) {
            return 0;
        }
        
        const clientRequests = this.requests.get(clientId);
        if (clientRequests.length === 0) {
            return 0;
        }
        
        const oldestRequest = Math.min(...clientRequests);
        return oldestRequest + this.windowMs;
    }
}

// Fix 5: Enhanced Caching System
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = 300000; // 5 minutes TTL
        this.maxSize = 1000;
    }
    
    set(key, value, customTtl = null) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        const ttl = customTtl || this.ttl;
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }
        
        // Check if item is expired
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    delete(key) {
        return this.cache.delete(key);
    }
    
    clear() {
        this.cache.clear();
    }
    
    size() {
        return this.cache.size;
    }
    
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

// Fix 6: Enhanced Logging System
class Logger {
    static log(level, message, context = {}, error = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            context,
            error: error ? {
                message: error.message,
                stack: error.stack
            } : null
        };
        
        console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, logEntry);
        
        // In production, you might want to send logs to a logging service
        if (process.env.NODE_ENV === 'production') {
            this.sendToLogService(logEntry);
        }
    }
    
    static info(message, context = {}) {
        this.log('info', message, context);
    }
    
    static warn(message, context = {}) {
        this.log('warn', message, context);
    }
    
    static error(message, error = null, context = {}) {
        this.log('error', message, context, error);
    }
    
    static debug(message, context = {}) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, context);
        }
    }
    
    static sendToLogService(logEntry) {
        // Implementation for sending logs to external service
        // This could be ELK stack, Splunk, CloudWatch, etc.
    }
}

// Initialize global instances
const performanceMonitor = new PerformanceMonitor();
const rateLimiter = new RateLimiter();
const cacheManager = new CacheManager();

// Periodic cleanup
setInterval(() => {
    cacheManager.cleanup();
    performanceMonitor.triggerCleanup();
}, 300000); // Every 5 minutes

module.exports = {
    ErrorHandler,
    PerformanceMonitor,
    InputValidator,
    RateLimiter,
    CacheManager,
    Logger,
    performanceMonitor,
    rateLimiter,
    cacheManager
};
