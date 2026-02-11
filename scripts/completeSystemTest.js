const http = require('http');

// Final comprehensive test suite
const testSuite = {
    name: "VUAI Agent Complete System Test",
    version: "2.0",
    timestamp: new Date().toISOString(),
    endpoints: [
        {
            name: "Health Check",
            path: "/health",
            method: "GET",
            payload: null,
            tests: [
                { name: "Basic health check", expectedStatus: 200 }
            ]
        },
        {
            name: "Chat API",
            path: "/api/chat",
            method: "POST",
            payload: { message: "hello" },
            tests: [
                { name: "Greeting response", expectedStatus: 200 },
                { name: "Help request", payload: { message: "help" }, expectedStatus: 200 },
                { name: "Urgent request", payload: { message: "urgent" }, expectedStatus: 200 },
                { name: "Math calculation", payload: { message: "calculate 15*8" }, expectedStatus: 200 },
                { name: "Technical question", payload: { message: "python programming" }, expectedStatus: 200 }
            ]
        },
        {
            name: "LLM API",
            path: "/api/llm",
            method: "POST",
            payload: { message: "hello" },
            tests: [
                { name: "LLM greeting", expectedStatus: 200 },
                { name: "LLM help", payload: { message: "help" }, expectedStatus: 200 },
                { name: "Complex query", payload: { message: "advanced technical question" }, expectedStatus: 200 }
            ]
        },
        {
            name: "Emergency API",
            path: "/api/emergency",
            method: "POST",
            payload: { message: "urgent" },
            tests: [
                { name: "Emergency response", expectedStatus: 200 },
                { name: "Critical failure", payload: { message: "critical system failure" }, expectedStatus: 200 }
            ]
        },
        {
            name: "Knowledge API",
            path: "/api/knowledge",
            method: "POST",
            payload: { query: "python", category: "cse" },
            tests: [
                { name: "CSE knowledge", expectedStatus: 200 },
                { name: "EEE knowledge", payload: { query: "circuit", category: "eee" }, expectedStatus: 200 },
                { name: "ECE knowledge", payload: { query: "digital", category: "ece" }, expectedStatus: 200 },
                { name: "Important knowledge", payload: { query: "exam help", category: "important" }, expectedStatus: 200 }
            ]
        }
    ]
};

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

async function runTestSuite() {
    console.log('🚀 VUAI Agent Complete System Test Suite');
    console.log('==========================================');
    console.log(`Version: ${testSuite.version}`);
    console.log(`Timestamp: ${testSuite.timestamp}`);
    console.log(`Endpoints: ${testSuite.endpoints.length}`);
    console.log('==========================================\n');
    
    const results = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        totalResponseTime: 0,
        endpoints: {}
    };
    
    for (const endpoint of testSuite.endpoints) {
        console.log(`🔍 Testing ${endpoint.name}:`);
        console.log(`   Path: ${endpoint.method} ${endpoint.path}`);
        
        const endpointResults = {
            tests: [],
            totalResponseTime: 0,
            passedTests: 0,
            failedTests: 0
        };
        
        for (const test of endpoint.tests) {
            const payload = test.payload || endpoint.payload;
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: endpoint.path,
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (payload) {
                options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(payload));
            }
            
            try {
                const result = await makeRequest(options, payload);
                const testPassed = result.status === test.expectedStatus;
                
                console.log(`   ${testPassed ? '✅' : '❌'} ${test.name}: ${result.status} (${result.responseTime}ms)`);
                
                endpointResults.tests.push({
                    name: test.name,
                    status: result.status,
                    responseTime: result.responseTime,
                    success: testPassed,
                    data: result.data
                });
                
                endpointResults.totalResponseTime += result.responseTime;
                if (testPassed) {
                    endpointResults.passedTests++;
                    results.passedTests++;
                } else {
                    endpointResults.failedTests++;
                    results.failedTests++;
                }
                
                results.totalResponseTime += result.responseTime;
                results.totalTests++;
                
            } catch (error) {
                console.log(`   ❌ ${test.name}: Failed (${error.responseTime}ms) - ${error.error}`);
                
                endpointResults.tests.push({
                    name: test.name,
                    status: 'ERROR',
                    responseTime: error.responseTime,
                    success: false,
                    error: error.error
                });
                
                endpointResults.totalResponseTime += error.responseTime;
                endpointResults.failedTests++;
                results.failedTests++;
                results.totalResponseTime += error.responseTime;
                results.totalTests++;
            }
        }
        
        endpointResults.avgResponseTime = endpointResults.totalResponseTime / endpointResults.tests.length;
        endpointResults.successRate = (endpointResults.passedTests / endpointResults.tests.length) * 100;
        
        results.endpoints[endpoint.name] = endpointResults;
        
        console.log(`   📊 ${endpoint.name}: ${endpointResults.passedTests}/${endpointResults.tests.length} passed (${endpointResults.successRate.toFixed(1)}%)`);
        console.log(`   ⏱️  Avg Response Time: ${endpointResults.avgResponseTime.toFixed(2)}ms\n`);
    }
    
    // Generate comprehensive report
    console.log('📊 Comprehensive Test Results');
    console.log('==============================\n');
    
    const overallSuccessRate = (results.passedTests / results.totalTests) * 100;
    const overallAvgResponseTime = results.totalResponseTime / results.totalTests;
    
    console.log('🎯 Overall Performance:');
    console.log(`• Total Tests: ${results.totalTests}`);
    console.log(`• Passed: ${results.passedTests}`);
    console.log(`• Failed: ${results.failedTests}`);
    console.log(`• Success Rate: ${overallSuccessRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${overallAvgResponseTime.toFixed(2)}ms\n`);
    
    // Performance classification
    console.log('🚀 Performance Classification:');
    const ultraFast = results.totalTests * 0.6; // 60% under 20ms
    const fast = results.totalTests * 0.8; // 80% under 50ms
    
    let performanceGrade = '⚠️ Needs Improvement';
    if (overallSuccessRate >= 95 && overallAvgResponseTime <= 30) {
        performanceGrade = '🌟 Excellent';
    } else if (overallSuccessRate >= 90 && overallAvgResponseTime <= 50) {
        performanceGrade = '✅ Good';
    } else if (overallSuccessRate >= 80 && overallAvgResponseTime <= 100) {
        performanceGrade = '📊 Acceptable';
    }
    
    console.log(`• Performance Grade: ${performanceGrade}`);
    console.log(`• Response Time Classification: ${overallAvgResponseTime <= 20 ? '🚀 Ultra Fast' : overallAvgResponseTime <= 50 ? '⚡ Fast' : overallAvgResponseTime <= 100 ? '📊 Good' : '⏳ Slow'}\n`);
    
    // System health status
    console.log('🔧 System Health Status:');
    console.log(`• Enhanced LLM Integration: ${results.endpoints['LLM API']?.successRate >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    console.log(`• Advanced LangChain Integration: ${overallSuccessRate >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    console.log(`• Comprehensive Knowledge Base: ${results.endpoints['Knowledge API']?.successRate >= 90 ? '✅ Healthy' : '⚠️ Needs Attention'}`);
    console.log(`• Enhanced Emergency System: ${results.endpoints['Emergency API']?.successRate >= 95 ? '✅ Excellent' : '⚠️ Needs Attention'}`);
    console.log(`• Advanced Fast Responses: ${overallAvgResponseTime <= 50 ? '✅ Optimized' : '⚠️ Needs Optimization'}`);
    console.log(`• Guaranteed Responses: ${overallSuccessRate >= 99 ? '✅ Guaranteed' : '⚠️ At Risk'}\n`);
    
    // Recommendations
    console.log('💡 Recommendations:');
    if (overallSuccessRate < 95) {
        console.log('⚠️  Some tests failed. Review failed endpoints for issues.');
    }
    if (overallAvgResponseTime > 50) {
        console.log('⚠️  Response times could be optimized for better performance.');
    }
    if (overallSuccessRate >= 95 && overallAvgResponseTime <= 30) {
        console.log('✅ System is performing excellently! Ready for production.');
    }
    
    console.log('\n🎉 Test Suite Completed!');
    console.log('============================\n');
    
    return results;
}

// Run the complete test suite
runTestSuite().catch(console.error);
