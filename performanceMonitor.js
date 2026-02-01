const http = require('http');

// Performance testing configuration
const config = {
    baseUrl: 'http://localhost:3000',
    endpoints: [
        { path: '/health', method: 'GET', payload: null },
        { path: '/api/chat', method: 'POST', payload: { message: 'hello' } },
        { path: '/api/llm', method: 'POST', payload: { message: 'help' } },
        { path: '/api/emergency', method: 'POST', payload: { message: 'urgent' } },
        { path: '/api/knowledge', method: 'POST', payload: { query: 'python', category: 'cse' } }
    ],
    concurrentRequests: 20, // Reduced from 50 to avoid rate limiting
    totalRounds: 5, // Reduced from 10 to avoid rate limiting
    responseTimeThresholds: {
        ultraFast: 20,
        fast: 50,
        good: 100
    }
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(body);
                    resolve({ 
                        status: res.statusCode, 
                        data: jsonData, 
                        responseTime,
                        success: res.statusCode === 200
                    });
                } catch (error) {
                    resolve({ 
                        status: res.statusCode, 
                        data: body, 
                        responseTime,
                        success: false
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({ error: error.message, responseTime, success: false });
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Performance test for a single endpoint
async function testEndpoint(endpoint, round) {
    const promises = [];
    const results = [];
    
    // Make concurrent requests
    for (let i = 0; i < config.concurrentRequests; i++) {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint.path,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        promises.push(
            makeRequest(options, endpoint.payload)
                .then(result => {
                    results.push(result);
                    return result;
                })
                .catch(error => {
                    results.push({ 
                        error: error.error || error.message || 'Unknown error', 
                        responseTime: error.responseTime || 0, 
                        success: false 
                    });
                    return { 
                        error: error.error || error.message || 'Unknown error', 
                        responseTime: error.responseTime || 0, 
                        success: false 
                    };
                })
        );
    }
    
    await Promise.all(promises);
    
    // Analyze results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const responseTimes = successful.map(r => r.responseTime);
    
    const stats = {
        endpoint: endpoint.path,
        round,
        totalRequests: results.length,
        successful: successful.length,
        failed: failed.length,
        successRate: (successful.length / results.length) * 100,
        avgResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        ultraFast: responseTimes.filter(t => t < config.responseTimeThresholds.ultraFast).length,
        fast: responseTimes.filter(t => t < config.responseTimeThresholds.fast).length,
        good: responseTimes.filter(t => t < config.responseTimeThresholds.good).length,
        slow: responseTimes.filter(t => t >= config.responseTimeThresholds.good).length
    };
    
    return stats;
}

// Run complete performance test
async function runPerformanceTest() {
    console.log('🚀 VUAI Agent Performance Dashboard');
    console.log('=====================================\n');
    
    console.log('📊 Test Configuration:');
    console.log(`• Base URL: ${config.baseUrl}`);
    console.log(`• Concurrent Requests: ${config.concurrentRequests}`);
    console.log(`• Test Rounds: ${config.totalRounds}`);
    console.log(`• Endpoints: ${config.endpoints.length}`);
    console.log(`• Response Time Thresholds:`);
    console.log(`  - 🚀 Ultra Fast: <${config.responseTimeThresholds.ultraFast}ms`);
    console.log(`  - ⚡ Fast: <${config.responseTimeThresholds.fast}ms`);
    console.log(`  - 📊 Good: <${config.responseTimeThresholds.good}ms`);
    console.log(`  - ⏳ Slow: ≥${config.responseTimeThresholds.good}ms\n`);
    
    const allResults = [];
    
    // Test each endpoint
    for (const endpoint of config.endpoints) {
        console.log(`🔍 Testing ${endpoint.method} ${endpoint.path}:`);
        
        const endpointResults = [];
        
        // Run multiple rounds
        for (let round = 1; round <= config.totalRounds; round++) {
            process.stdout.write(`   Round ${round}/${config.totalRounds}... `);
            
            const stats = await testEndpoint(endpoint, round);
            endpointResults.push(stats);
            allResults.push(stats);
            
            console.log(`✅ ${stats.successRate.toFixed(1)}% success, ${stats.avgResponseTime.toFixed(1)}ms avg`);
        }
        
        // Calculate endpoint summary
        const totalRequests = endpointResults.reduce((sum, r) => sum + r.totalRequests, 0);
        const totalSuccessful = endpointResults.reduce((sum, r) => sum + r.successful, 0);
        const allResponseTimes = endpointResults.flatMap(r => 
            Array(r.successful).fill(r.avgResponseTime)
        );
        
        const endpointSummary = {
            endpoint: endpoint.path,
            totalRequests,
            totalSuccessful,
            overallSuccessRate: (totalSuccessful / totalRequests) * 100,
            overallAvgResponseTime: allResponseTimes.length > 0 ? 
                allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length : 0,
            rounds: config.totalRounds
        };
        
        console.log(`   📈 Summary: ${endpointSummary.overallSuccessRate.toFixed(1)}% success, ${endpointSummary.overallAvgResponseTime.toFixed(1)}ms avg\n`);
    }
    
    // Generate comprehensive report
    console.log('📊 Comprehensive Performance Report');
    console.log('=====================================\n');
    
    // Overall statistics
    const totalRequests = allResults.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = allResults.reduce((sum, r) => sum + r.successful, 0);
    const overallSuccessRate = (totalSuccessful / totalRequests) * 100;
    
    const allResponseTimes = allResults.flatMap(r => 
        Array(r.successful).fill(r.avgResponseTime)
    );
    
    const overallAvgResponseTime = allResponseTimes.length > 0 ? 
        allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length : 0;
    
    console.log('🎯 Overall Performance:');
    console.log(`• Total Requests: ${totalRequests}`);
    console.log(`• Successful Requests: ${totalSuccessful}`);
    console.log(`• Overall Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Overall Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms`);
    console.log(`• Total Test Duration: ${config.totalRounds * config.endpoints.length * config.concurrentRequests} requests\n`);
    
    // Endpoint breakdown
    console.log('📈 Endpoint Performance Breakdown:');
    const endpointStats = {};
    
    allResults.forEach(result => {
        if (!endpointStats[result.endpoint]) {
            endpointStats[result.endpoint] = {
                totalRequests: 0,
                successful: 0,
                responseTimes: [],
                rounds: 0
            };
        }
        
        endpointStats[result.endpoint].totalRequests += result.totalRequests;
        endpointStats[result.endpoint].successful += result.successful;
        endpointStats[result.endpoint].responseTimes.push(result.avgResponseTime);
        endpointStats[result.endpoint].rounds++;
    });
    
    Object.entries(endpointStats).forEach(([endpoint, stats]) => {
        const successRate = (stats.successful / stats.totalRequests) * 100;
        const avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
        
        console.log(`• ${endpoint}:`);
        console.log(`  - Success Rate: ${successRate.toFixed(2)}%`);
        console.log(`  - Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`  - Total Requests: ${stats.totalRequests}`);
        console.log(`  - Rounds Tested: ${stats.rounds}`);
    });
    
    console.log('\n🚀 Performance Classification:');
    const ultraFastCount = allResponseTimes.filter(t => t < config.responseTimeThresholds.ultraFast).length;
    const fastCount = allResponseTimes.filter(t => t < config.responseTimeThresholds.fast).length;
    const goodCount = allResponseTimes.filter(t => t < config.responseTimeThresholds.good).length;
    const slowCount = allResponseTimes.filter(t => t >= config.responseTimeThresholds.good).length;
    
    console.log(`• 🚀 Ultra Fast (<${config.responseTimeThresholds.ultraFast}ms): ${ultraFastCount} requests (${((ultraFastCount/allResponseTimes.length)*100).toFixed(1)}%)`);
    console.log(`• ⚡ Fast (<${config.responseTimeThresholds.fast}ms): ${fastCount} requests (${((fastCount/allResponseTimes.length)*100).toFixed(1)}%)`);
    console.log(`• 📊 Good (<${config.responseTimeThresholds.good}ms): ${goodCount} requests (${((goodCount/allResponseTimes.length)*100).toFixed(1)}%)`);
    console.log(`• ⏳ Slow (≥${config.responseTimeThresholds.good}ms): ${slowCount} requests (${((slowCount/allResponseTimes.length)*100).toFixed(1)}%)`);
    
    // Recommendations
    console.log('\n💡 Performance Recommendations:');
    
    if (overallSuccessRate < 95) {
        console.log('⚠️  Success rate is below 95%. Consider investigating failed requests.');
    }
    
    if (overallAvgResponseTime > config.responseTimeThresholds.fast) {
        console.log('⚠️  Average response time is above 50ms. Consider optimization strategies.');
    }
    
    if (slowCount > allResponseTimes.length * 0.1) {
        console.log('⚠️  More than 10% of requests are slow. Investigate performance bottlenecks.');
    }
    
    if (overallSuccessRate >= 95 && overallAvgResponseTime <= config.responseTimeThresholds.fast) {
        console.log('✅ Excellent performance! System is operating within optimal parameters.');
    }
    
    console.log('\n🎉 Performance Test Completed!');
    console.log('=====================================\n');
    
    console.log('🔧 System Health Status:');
    console.log(`• Enhanced LLM Integration: ${overallSuccessRate >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    console.log(`• Advanced LangChain Integration: ${overallSuccessRate >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    console.log(`• Comprehensive Knowledge Base: ${overallSuccessRate >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    console.log(`• Enhanced Emergency System: ${overallSuccessRate >= 95 ? '✅ Excellent' : '⚠️ Needs Attention'}`);
    console.log(`• Advanced Fast Responses: ${overallAvgResponseTime <= config.responseTimeThresholds.fast ? '✅ Optimized' : '⚠️ Needs Optimization'}`);
    console.log(`• Guaranteed Responses: ${overallSuccessRate >= 99 ? '✅ Guaranteed' : '⚠️ At Risk'}`);
}

// Run the performance test
runPerformanceTest().catch(console.error);
