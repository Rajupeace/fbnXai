// VUAI Agent Performance Dashboard
const http = require('http');
const { performance } = require('perf_hooks');

console.log('📊 VUAI Agent Performance Dashboard');
console.log('===================================\n');

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            responseTimes: [],
            endpoints: {
                health: { count: 0, totalTime: 0, avgTime: 0 },
                chat: { count: 0, totalTime: 0, avgTime: 0 },
                llm: { count: 0, totalTime: 0, avgTime: 0 },
                emergency: { count: 0, totalTime: 0, avgTime: 0 },
                knowledge: { count: 0, totalTime: 0, avgTime: 0 }
            },
            sources: {
                'enhanced-fast-response': 0,
                'advanced-math-calculator': 0,
                'enhanced-knowledge-base': 0,
                'advanced-default-response': 0,
                'llm-greeting': 0,
                'llm-help': 0,
                'llm-urgent': 0,
                'llm-complex': 0,
                'enhanced-emergency-system': 0
            }
        };
    }
    
    recordRequest(endpoint, responseTime, success, source) {
        this.metrics.totalRequests++;
        
        if (success) {
            this.metrics.successfulRequests++;
            this.metrics.responseTimes.push(responseTime);
            
            if (this.metrics.endpoints[endpoint]) {
                this.metrics.endpoints[endpoint].count++;
                this.metrics.endpoints[endpoint].totalTime += responseTime;
                this.metrics.endpoints[endpoint].avgTime = 
                    this.metrics.endpoints[endpoint].totalTime / this.metrics.endpoints[endpoint].count;
            }
            
            if (this.metrics.sources[source]) {
                this.metrics.sources[source]++;
            }
        } else {
            this.metrics.failedRequests++;
        }
    }
    
    getStats() {
        const avgResponseTime = this.metrics.responseTimes.length > 0 
            ? this.metrics.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.responseTimes.length 
            : 0;
        
        const minResponseTime = this.metrics.responseTimes.length > 0 
            ? Math.min(...this.metrics.responseTimes) 
            : 0;
        
        const maxResponseTime = this.metrics.responseTimes.length > 0 
            ? Math.max(...this.metrics.responseTimes) 
            : 0;
        
        return {
            ...this.metrics,
            avgResponseTime,
            minResponseTime,
            maxResponseTime,
            successRate: this.metrics.totalRequests > 0 
                ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
                : 0
        };
    }
}

const monitor = new PerformanceMonitor();

// Test function with performance monitoring
const testEndpointWithMetrics = (endpoint, data, endpointName) => {
    return new Promise((resolve) => {
        const postData = JSON.stringify(data);
        const startTime = performance.now();
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                const endTime = performance.now();
                const responseTime = Math.round(endTime - startTime);
                
                try {
                    const jsonData = JSON.parse(responseData);
                    const success = res.statusCode === 200;
                    const source = jsonData.source || 'unknown';
                    
                    monitor.recordRequest(endpointName, responseTime, success, source);
                    
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        data: jsonData,
                        responseTime,
                        endpoint,
                        source
                    });
                } catch (error) {
                    monitor.recordRequest(endpointName, responseTime, false, 'parse-error');
                    
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        error: error.message,
                        response: responseData,
                        responseTime,
                        endpoint,
                        source: 'parse-error'
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            monitor.recordRequest(endpointName, responseTime, false, 'network-error');
            
            resolve({
                success: false,
                error: error.message,
                responseTime,
                endpoint,
                source: 'network-error'
            });
        });
        
        req.on('timeout', () => {
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            req.destroy();
            monitor.recordRequest(endpointName, responseTime, false, 'timeout');
            
            resolve({
                success: false,
                error: 'Request timeout',
                responseTime,
                endpoint,
                source: 'timeout'
            });
        });
        
        req.write(postData);
        req.end();
    });
};

// Load testing function
const performLoadTest = async (endpoint, data, endpointName, concurrentRequests = 10) => {
    console.log(`🔄 Load Testing ${endpointName} with ${concurrentRequests} concurrent requests...`);
    
    const promises = [];
    for (let i = 0; i < concurrentRequests; i++) {
        promises.push(testEndpointWithMetrics(endpoint, data, endpointName));
    }
    
    const results = await Promise.all(promises);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    
    console.log(`   ✅ Successful: ${successful}/${concurrentRequests}`);
    console.log(`   ❌ Failed: ${failed}/${concurrentRequests}`);
    console.log(`   ⚡ Average Time: ${Math.round(avgTime)}ms`);
    console.log('');
    
    return results;
};

// Performance test suite
async function runPerformanceDashboard() {
    console.log('🚀 Starting VUAI Agent Performance Dashboard...\n');
    
    // Test 1: Health endpoint performance
    console.log('1. Health Endpoint Performance:');
    await performLoadTest('/health', {}, 'health', 5);
    
    // Test 2: Chat endpoint performance
    console.log('2. Chat Endpoint Performance:');
    const chatTests = [
        { message: 'hello', context: {} },
        { message: 'help', context: {} },
        { message: 'urgent', context: {} },
        { message: 'calculate 25*4', context: {} },
        { message: 'python programming', context: {} }
    ];
    
    for (const test of chatTests) {
        await performLoadTest('/api/chat', test, 'chat', 3);
    }
    
    // Test 3: LLM endpoint performance
    console.log('3. LLM Endpoint Performance:');
    const llmTests = [
        { message: 'hello', context: {} },
        { message: 'help', context: {} },
        { message: 'complex problem', context: {} }
    ];
    
    for (const test of llmTests) {
        await performLoadTest('/api/llm', test, 'llm', 3);
    }
    
    // Test 4: Emergency endpoint performance
    console.log('4. Emergency Endpoint Performance:');
    const emergencyTests = [
        { message: 'urgent', context: {} },
        { message: 'critical error', context: {} }
    ];
    
    for (const test of emergencyTests) {
        await performLoadTest('/api/emergency', test, 'emergency', 3);
    }
    
    // Test 5: Knowledge endpoint performance
    console.log('5. Knowledge Endpoint Performance:');
    const knowledgeTests = [
        { query: 'electrical engineering', category: 'eee' },
        { query: 'machine learning', category: 'cse' }
    ];
    
    for (const test of knowledgeTests) {
        await performLoadTest('/api/knowledge', test, 'knowledge', 3);
    }
    
    // Display performance dashboard
    console.log('📊 Performance Dashboard Results:');
    console.log('===============================\n');
    
    const stats = monitor.getStats();
    
    console.log('🎯 Overall Statistics:');
    console.log(`   Total Requests: ${stats.totalRequests}`);
    console.log(`   Successful: ${stats.successfulRequests}`);
    console.log(`   Failed: ${stats.failedRequests}`);
    console.log(`   Success Rate: ${stats.successRate.toFixed(2)}%`);
    console.log(`   Average Response Time: ${stats.avgResponseTime.toFixed(2)}ms`);
    console.log(`   Min Response Time: ${stats.minResponseTime}ms`);
    console.log(`   Max Response Time: ${stats.maxResponseTime}ms\n`);
    
    console.log('📡 Endpoint Performance:');
    for (const [endpoint, metrics] of Object.entries(stats.endpoints)) {
        if (metrics.count > 0) {
            console.log(`   ${endpoint.toUpperCase()}:`);
            console.log(`     Requests: ${metrics.count}`);
            console.log(`     Average Time: ${metrics.avgTime.toFixed(2)}ms`);
            console.log(`     Total Time: ${metrics.totalTime}ms`);
        }
    }
    
    console.log('\n🔄 Response Source Distribution:');
    const totalSources = Object.values(stats.sources).reduce((a, b) => a + b, 0);
    for (const [source, count] of Object.entries(stats.sources)) {
        if (count > 0) {
            const percentage = ((count / totalSources) * 100).toFixed(1);
            console.log(`   ${source}: ${count} (${percentage}%)`);
        }
    }
    
    console.log('\n⚡ Performance Analysis:');
    if (stats.avgResponseTime < 20) {
        console.log('   🚀 EXCELLENT: Average response time under 20ms');
    } else if (stats.avgResponseTime < 50) {
        console.log('   ⚡ GOOD: Average response time under 50ms');
    } else if (stats.avgResponseTime < 100) {
        console.log('   📊 ACCEPTABLE: Average response time under 100ms');
    } else {
        console.log('   ⏳ NEEDS OPTIMIZATION: Average response time over 100ms');
    }
    
    if (stats.successRate > 95) {
        console.log('   🎯 EXCELLENT: Success rate over 95%');
    } else if (stats.successRate > 90) {
        console.log('   ✅ GOOD: Success rate over 90%');
    } else {
        console.log('   ⚠️ NEEDS ATTENTION: Success rate below 90%');
    }
    
    console.log('\n🔧 Optimization Recommendations:');
    if (stats.avgResponseTime > 50) {
        console.log('   • Consider implementing response caching');
        console.log('   • Optimize database queries');
        console.log('   • Review response generation logic');
    }
    
    if (stats.successRate < 95) {
        console.log('   • Investigate failed requests');
        console.log('   • Implement better error handling');
        console.log('   • Add retry mechanisms');
    }
    
    console.log('\n🎉 Performance Dashboard Complete!');
    console.log('==================================\n');
    
    console.log('📈 Key Performance Indicators:');
    console.log(`• Response Speed: ${stats.avgResponseTime < 20 ? 'Excellent' : stats.avgResponseTime < 50 ? 'Good' : 'Needs Improvement'}`);
    console.log(`• Reliability: ${stats.successRate > 95 ? 'Excellent' : stats.successRate > 90 ? 'Good' : 'Needs Improvement'}`);
    console.log(`• System Health: ${stats.successRate > 90 && stats.avgResponseTime < 50 ? 'Optimal' : 'Good'}`);
    console.log(`• Load Handling: ${stats.totalRequests > 50 ? 'Excellent' : stats.totalRequests > 25 ? 'Good' : 'Testing More'}`);
}

// Run the performance dashboard
runPerformanceDashboard().catch(console.error);
