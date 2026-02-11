const http = require('http');

// Stress test with concurrent requests
const stressConfig = {
    concurrentRequests: 10,
    testMessages: [
        "hello",
        "help me learn",
        "urgent assistance needed",
        "tell me about electrical engineering",
        "calculate 25 * 4",
        "what is python programming",
        "check my progress",
        "navigate to machine learning",
        "explain circuits",
        "show my dashboard"
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
    
    console.log(`Sending ${stressConfig.concurrentRequests} concurrent requests...\n`);
    
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < stressConfig.concurrentRequests; i++) {
        const message = stressConfig.testMessages[i % stressConfig.testMessages.length];
        
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
            userId: `stress_test_user_${i}`,
            context: { testType: 'stress', requestId: i }
        });
        
        promises.push(promise);
    }
    
    try {
        const results = await Promise.allSettled(promises);
        const totalTime = Date.now() - startTime;
        
        let successfulRequests = 0;
        let totalResponseTime = 0;
        let minResponseTime = Infinity;
        let maxResponseTime = 0;
        let errors = [];
        
        for (const result of results) {
            if (result.status === 'fulfilled') {
                const response = result.value;
                if (response.success) {
                    successfulRequests++;
                    totalResponseTime += response.responseTime;
                    minResponseTime = Math.min(minResponseTime, response.responseTime);
                    maxResponseTime = Math.max(maxResponseTime, response.responseTime);
                } else {
                    errors.push(`HTTP ${response.status}`);
                }
            } else {
                errors.push(result.reason.error || result.reason.message);
            }
        }
        
        console.log('📊 Stress Test Results');
        console.log('====================');
        console.log(`Total Requests: ${stressConfig.concurrentRequests}`);
        console.log(`Successful: ${successfulRequests}`);
        console.log(`Failed: ${stressConfig.concurrentRequests - successfulRequests}`);
        console.log(`Success Rate: ${((successfulRequests / stressConfig.concurrentRequests) * 100).toFixed(2)}%`);
        console.log(`Total Time: ${totalTime}ms`);
        
        if (successfulRequests > 0) {
            console.log(`Avg Response Time: ${(totalResponseTime / successfulRequests).toFixed(2)}ms`);
            console.log(`Min Response Time: ${minResponseTime}ms`);
            console.log(`Max Response Time: ${maxResponseTime}ms`);
        }
        
        console.log(`Requests per Second: ${(stressConfig.concurrentRequests / (totalTime / 1000)).toFixed(2)}`);
        
        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            const errorCounts = {};
            errors.forEach(error => {
                errorCounts[error] = (errorCounts[error] || 0) + 1;
            });
            Object.entries(errorCounts).forEach(([error, count]) => {
                console.log(`• ${error}: ${count} times`);
            });
        }
        
        console.log('\n🎯 Stress Test Assessment:');
        const successRate = (successfulRequests / stressConfig.concurrentRequests) * 100;
        
        if (successRate >= 95) {
            console.log('🏆 EXCELLENT: Handles stress perfectly!');
        } else if (successRate >= 85) {
            console.log('✅ GOOD: Handles stress well!');
        } else if (successRate >= 70) {
            console.log('⚠️ ACCEPTABLE: Some issues under stress');
        } else {
            console.log('❌ POOR: Struggles under stress');
        }
        
    } catch (error) {
        console.log('❌ Stress test failed:', error.message);
    }
}

// Run stress test
runStressTest().catch(console.error);
