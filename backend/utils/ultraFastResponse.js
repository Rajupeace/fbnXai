// Ultra-Fast Response Engine - Optimized for <50ms Response Time
class UltraFastResponse {
    constructor() {
        this.responseCache = new Map();
        this.patterns = new Map();
        this.initializePatterns();
        this.responseTime = 0;
        this.cacheHits = 0;
        this.totalRequests = 0;
    }

    // Initialize ultra-fast response patterns
    initializePatterns() {
        // Common questions with instant responses
        this.patterns.set('hello', {
            response: 'Hello! How can I help you today? 🌟',
            priority: 1,
            responseTime: 5
        });

        this.patterns.set('help', {
            response: 'I can help with studies, assignments, exams, and technical problems! 📚',
            priority: 1,
            responseTime: 5
        });

        this.patterns.set('urgent', {
            response: '🚨 Urgent help available! What do you need immediately?',
            priority: 1,
            responseTime: 5
        });

        this.patterns.set('formula', {
            response: '📐 Need a formula? Ask "formula for [topic]" for instant help!',
            priority: 2,
            responseTime: 10
        });

        this.patterns.set('calculate', {
            response: '🧮 Calculator ready! Tell me what to calculate.',
            priority: 2,
            responseTime: 10
        });

        this.patterns.set('exam', {
            response: '📚 Exam help available! Ask about specific topics or preparation.',
            priority: 2,
            responseTime: 10
        });

        this.patterns.set('assignment', {
            response: '📝 Assignment help ready! Describe your task for step-by-step guidance.',
            priority: 2,
            responseTime: 10
        });

        this.patterns.set('error', {
            response: '🔧 Technical help available! Describe the error for troubleshooting.',
            priority: 2,
            responseTime: 10
        });

        // Subject-specific ultra-fast responses
        this.patterns.set('ohms law', {
            response: '⚡ Ohm\'s Law: V = I × R\n• Voltage (V) = Current (I) × Resistance (R)\n• Current (I) = Voltage (V) / Resistance (R)\n• Resistance (R) = Voltage (V) / Current (I)',
            priority: 3,
            responseTime: 15
        });

        this.patterns.set('power', {
            response: '⚡ Power Formula: P = V × I = I²R = V²/R\n• P = VI (Voltage × Current)\n• P = I²R (Current² × Resistance)\n• P = V²/R (Voltage² / Resistance)',
            priority: 3,
            responseTime: 15
        });

        this.patterns.set('kirchhoff', {
            response: '⚡ Kirchhoff\'s Laws:\n• KCL: Sum of currents at node = 0\n• KVL: Sum of voltages in loop = 0',
            priority: 3,
            responseTime: 15
        });

        this.patterns.set('pid', {
            response: '🎛️ PID Controller: u(t) = Kp×e(t) + Ki×∫e(t)dt + Kd×de/dt\n• P: Proportional, I: Integral, D: Derivative',
            priority: 3,
            responseTime: 15
        });

        this.patterns.set('binary', {
            response: '💻 Binary to Decimal: Multiply each bit by 2^position and sum\n• Example: 1010 = 1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 2 = 10',
            priority: 3,
            responseTime: 15
        });

        this.patterns.set('quadratic', {
            response: '📐 Quadratic Formula: x = (-b ± √(b²-4ac))/2a\n• For ax² + bx + c = 0',
            priority: 3,
            responseTime: 15
        });

        // Emergency responses
        this.patterns.set('emergency', {
            response: '🚨 Emergency Help Available!\n• Technical Support: Check connections, restart device\n• Study Help: Focus on key concepts\n• Assignment Help: Break down into steps',
            priority: 1,
            responseTime: 5
        });

        // Quick math responses
        this.patterns.set('2+2', {
            response: '4',
            priority: 1,
            responseTime: 2
        });

        this.patterns.set('sqrt(16)', {
            response: '4',
            priority: 1,
            responseTime: 2
        });

        this.patterns.set('pi', {
            response: 'π ≈ 3.14159',
            priority: 1,
            responseTime: 2
        });

        this.patterns.set('e', {
            response: 'e ≈ 2.71828',
            priority: 1,
            responseTime: 2
        });
    }

    // Ultra-fast response generation
    getUltraFastResponse(message, context = {}) {
        const startTime = Date.now();
        this.totalRequests++;

        // Check cache first
        const cacheKey = message.toLowerCase().trim();
        const cached = this.responseCache.get(cacheKey);
        
        if (cached) {
            this.cacheHits++;
            this.responseTime = Date.now() - startTime;
            return {
                response: cached,
                cached: true,
                responseTime: this.responseTime,
                source: 'cache'
            };
        }

        // Pattern matching for ultra-fast responses
        const lowerMessage = message.toLowerCase().trim();
        
        // Direct pattern matches
        for (const [pattern, data] of this.patterns.entries()) {
            if (lowerMessage.includes(pattern)) {
                this.responseCache.set(cacheKey, data.response);
                this.responseTime = Date.now() - startTime;
                return {
                    response: data.response,
                    cached: false,
                    responseTime: this.responseTime,
                    source: 'pattern'
                };
            }
        }

        // Quick math calculations
        const mathResult = this.quickMathCalculation(message);
        if (mathResult) {
            this.responseCache.set(cacheKey, mathResult);
            this.responseTime = Date.now() - startTime;
            return {
                response: mathResult,
                cached: false,
                responseTime: this.responseTime,
                source: 'math'
            };
        }

        // Default ultra-fast response
        const defaultResponse = '⚡ Ultra-Fast Response System Active!\nAsk me anything for instant help! 🚀';
        this.responseCache.set(cacheKey, defaultResponse);
        this.responseTime = Date.now() - startTime;
        
        return {
            response: defaultResponse,
            cached: false,
            responseTime: this.responseTime,
            source: 'default'
        };
    }

    // Quick math calculations
    quickMathCalculation(message) {
        const lowerMessage = message.toLowerCase().trim();
        
        // Basic arithmetic
        const match = lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
        if (match) {
            const a = parseFloat(match[1]);
            const b = parseFloat(match[3]);
            const operator = match[2];
            
            let result;
            switch (operator) {
                case '+': result = a + b; break;
                case '-': result = a - b; break;
                case '*': result = a * b; break;
                case '/': result = a / b; break;
                default: return null;
            }
            
            return `🧮 ${a} ${operator} ${b} = ${result}`;
        }

        // Square root
        const sqrtMatch = lowerMessage.match(/sqrt\((\d+)\)/);
        if (sqrtMatch) {
            const num = parseFloat(sqrtMatch[1]);
            const result = Math.sqrt(num);
            return `🧮 √${num} = ${result.toFixed(4)}`;
        }

        // Power calculation
        const powerMatch = lowerMessage.match(/(\d+)\s*\^\s*(\d+)/);
        if (powerMatch) {
            const base = parseFloat(powerMatch[1]);
            const exp = parseFloat(powerMatch[2]);
            const result = Math.pow(base, exp);
            return `🧮 ${base}^${exp} = ${result.toFixed(4)}`;
        }

        return null;
    }

    // Get performance metrics
    getMetrics() {
        return {
            totalRequests: this.totalRequests,
            cacheHits: this.cacheHits,
            cacheHitRate: this.totalRequests > 0 ? 
                ((this.cacheHits / this.totalRequests) * 100).toFixed(2) + '%' : '0%',
            averageResponseTime: this.responseTime + 'ms',
            cacheSize: this.responseCache.size,
            patternsAvailable: this.patterns.size
        };
    }

    // Clear cache
    clearCache() {
        this.responseCache.clear();
        this.cacheHits = 0;
        this.totalRequests = 0;
        this.responseTime = 0;
    }

    // Add new pattern
    addPattern(keyword, response, priority = 2, responseTime = 10) {
        this.patterns.set(keyword.toLowerCase(), {
            response,
            priority,
            responseTime
        });
    }

    // Remove pattern
    removePattern(keyword) {
        this.patterns.delete(keyword.toLowerCase());
    }

    // Get all patterns
    getPatterns() {
        return Object.fromEntries(this.patterns);
    }
}

module.exports = UltraFastResponse;
