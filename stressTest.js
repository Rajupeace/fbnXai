const http = require('http');

// Stress test VUAI Agent with concurrent requests
const stressTestConfig = {
    concurrentRequests: 20,
    totalRounds: 3,
    testMessages: [
        "hello",
        "help me learn",
        "calculate 10 * 5",
        "urgent assistance needed",
        "tell me about AI",
        "check my progress",
        "navigate to database",
        "explain circuits"
    ]
};

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
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
            reject({
                error: error.message,
                responseTime,
                success: false
            });
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runStressTest() {
    console.log('🔥 VUAI Agent - Stress Test');
    console.log('==========================\n');
    
    let totalRequests = 0;
    let successfulRequests = 0;
    let totalResponseTime = 0;
    let minResponseTime = Infinity;
    let maxResponseTime = 0;
    let errors = [];
    
    for (let round = 1; round <= stressTestConfig.totalRounds; round++) {
        console.log(`🔄 Round ${round}/${stressTestConfig.totalRounds} - ${stressTestConfig.concurrentRequests} concurrent requests`);
        
        const promises = [];
        
        for (let i = 0; i < stressTestConfig.concurrentRequests; i++) {
            const message = stressTestConfig.testMessages[i % stressTestConfig.testMessages.length];
            
            const promise = makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/agent-assistant/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, {
                message: message,
                userId: `stress_test_round${round}_user${i}`,
                context: { round, requestId: i }
            });
            
            promises.push(promise);
            totalRequests++;
        }
        
        try {
            const results = await Promise.allSettled(promises);
            
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    const response = result.value;
                    if (response.success) {
                        successfulRequests++;
                        totalResponseTime += response.responseTime;
                        minResponseTime = Math.min(minResponseTime, response.responseTime);
                        maxResponseTime = Math.max(maxResponseTime, response.responseTime);
                    } else {
                        errors.push(`HTTP ${response.status}: ${response.data}`);
                    }
                } else {
                    errors.push(result.reason.error || result.reason.message);
                }
            }
            
            const roundSuccessRate = (successfulRequests / totalRequests) * 100;
            console.log(`   ✅ Round Complete: ${successfulRequests}/${totalRequests} successful (${roundSuccessRate.toFixed(1)}%)`);
            
        } catch (error) {
            console.log(`   ❌ Round Error: ${error.message}`);
            errors.push(error.message);
        }
        
        // Small delay between rounds
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Comprehensive Analysis
    console.log('\n📊 Stress Test Results');
    console.log('====================');
    
    const successRate = (successfulRequests / totalRequests) * 100;
    const avgResponseTime = successfulRequests > 0 ? (totalResponseTime / successfulRequests) : 0;
    
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${successfulRequests}`);
    console.log(`Failed: ${totalRequests - successfulRequests}`);
    console.log(`Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${minResponseTime === Infinity ? 'N/A' : minResponseTime + 'ms'}`);
    console.log(`Max Response Time: ${maxResponseTime}ms`);
    
    // Performance Classification
    console.log('\n🎯 Performance Classification:');
    if (successRate >= 95 && avgResponseTime < 50) {
        console.log('🏆 EXCELLENT: High success rate with fast responses');
    } else if (successRate >= 90 && avgResponseTime < 100) {
        console.log('✅ GOOD: Reliable performance with acceptable speed');
    } else if (successRate >= 80) {
        console.log('⚠️ ACCEPTABLE: Works but needs optimization');
    } else {
        console.log('❌ POOR: Significant issues detected');
    }
    
    // Error Analysis
    if (errors.length > 0) {
        console.log('\n❌ Error Analysis:');
        const errorCounts = {};
        errors.forEach(error => {
            const key = error.split(':')[0] || 'Unknown';
            errorCounts[key] = (errorCounts[key] || 0) + 1;
        });
        
        Object.entries(errorCounts).forEach(([error, count]) => {
            console.log(`• ${error}: ${count} occurrences`);
        });
    }
    
    // Load Testing Assessment
    console.log('\n🔥 Load Testing Assessment:');
    const requestsPerSecond = totalRequests / (stressTestConfig.totalRounds * 2); // Approximate
    console.log(`• Requests Handled: ${totalRequests}`);
    console.log(`• Approx RPS: ${requestsPerSecond.toFixed(2)}`);
    console.log(`• Concurrency Handling: ${stressTestConfig.concurrentRequests} simultaneous`);
    
    if (successRate >= 95) {
        console.log('✅ Excellent load handling capability');
    } else if (successRate >= 90) {
        console.log('✅ Good load handling capability');
    } else {
        console.log('⚠️ Load handling needs improvement');
    }
    
    console.log('\n🚀 Final Verdict:');
    if (successRate >= 95 && avgResponseTime < 50) {
        console.log('🏆 VUAI Agent is PRODUCTION READY with excellent performance!');
    } else if (successRate >= 90 && avgResponseTime < 100) {
        console.log('✅ VUAI Agent is READY with good performance!');
    } else {
        console.log('⚠️ VUAI Agent needs optimization before production deployment');
    }
}

// Run stress test
runStressTest().catch(console.error);
