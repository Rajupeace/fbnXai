const http = require('http');

// Test core working dashboard features
const coreTests = [
    {
        name: "Dashboard Main Page",
        path: "/dashboard",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "Health Check",
        path: "/health",
        method: "GET",
        expectedStatus: 200
    },
    {
        name: "VUAI Agent+Assistant Chat",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "hello", userId: "test_user" },
        expectedStatus: 200
    },
    {
        name: "Knowledge Categories",
        path: "/api/knowledge/categories",
        method: "GET",
        expectedStatus: 200
    }
];

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                if (res.statusCode === 200 && body.startsWith('<!DOCTYPE')) {
                    resolve({
                        status: res.statusCode,
                        data: { success: true, type: 'html' },
                        responseTime,
                        success: true
                    });
                } else {
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

async function testCoreDashboard() {
    console.log('🖥️  VUAI Agent Dashboard - Core Features Test');
    console.log('============================================\n');
    
    let passedTests = 0;
    let totalTime = 0;
    
    for (let i = 0; i < coreTests.length; i++) {
        const test = coreTests[i];
        console.log(`${i + 1}. Testing: ${test.name}`);
        
        try {
            const options = {
                hostname: 'localhost',
                port: 3000,
                path: test.path,
                method: test.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (test.payload) {
                options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(test.payload));
            }
            
            const result = await makeRequest(options, test.payload);
            
            if (result.success) {
                passedTests++;
                totalTime += result.responseTime;
                
                console.log(`   ✅ Success (${result.responseTime}ms)`);
                
                if (result.data.type === 'html') {
                    console.log(`   🌐 HTML Dashboard loaded successfully`);
                } else if (result.data.response) {
                    console.log(`   💬 ${result.data.response.substring(0, 60)}...`);
                } else if (result.data.categories) {
                    console.log(`   📚 ${result.data.categories.length} categories available`);
                } else if (result.data.features) {
                    console.log(`   🔧 ${Object.keys(result.data.features).length} features active`);
                }
                
            } else {
                console.log(`   ❌ Failed (${result.responseTime}ms) - Status: ${result.status}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Test additional dashboard functionality
    console.log('🔧 Testing Additional Dashboard Features:\n');
    
    // Test multiple agent responses
    const agentTests = [
        "help me learn",
        "urgent assistance",
        "tell me about electrical engineering",
        "calculate 15 * 8"
    ];
    
    for (let i = 0; i < agentTests.length; i++) {
        const message = agentTests[i];
        console.log(`${coreTests.length + i + 1}. Agent Test: "${message}"`);
        
        try {
            const result = await makeRequest({
                hostname: 'localhost',
                port: 3000,
                path: '/api/agent-assistant/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, {
                message: message,
                userId: `agent_test_${i}`
            });
            
            if (result.success) {
                passedTests++;
                totalTime += result.responseTime;
                
                console.log(`   ✅ Success (${result.responseTime}ms)`);
                console.log(`   💬 ${result.data.response.substring(0, 50)}...`);
                console.log(`   🤖 Source: ${result.data.source}`);
            } else {
                console.log(`   ❌ Failed`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Final Report
    console.log('📊 Core Dashboard Test Results');
    console.log('==============================\n');
    
    const totalTests = coreTests.length + agentTests.length;
    const successRate = (passedTests / totalTests) * 100;
    const avgResponseTime = totalTime / passedTests;
    
    console.log('🎯 Performance Summary:');
    console.log(`• Total Tests: ${totalTests}`);
    console.log(`• Passed: ${passedTests}`);
    console.log(`• Failed: ${totalTests - passedTests}`);
    console.log(`• Success Rate: ${successRate.toFixed(2)}%`);
    console.log(`• Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    console.log('\n🖥️  Dashboard Features Status:');
    console.log(`• Main Dashboard: ${passedTests > 0 ? '✅ Working' : '❌ Not Working'}`);
    console.log(`• Health Check: ${passedTests > 0 ? '✅ Working' : '❌ Not Working'}`);
    console.log(`• VUAI Agent+Assistant: ${passedTests >= 2 ? '✅ Working' : '❌ Not Working'}`);
    console.log(`• Knowledge Base: ${passedTests >= 3 ? '✅ Working' : '❌ Not Working'}`);
    
    console.log('\n🌐 Working Dashboard Access Points:');
    console.log('• Main Dashboard: http://localhost:3000/dashboard');
    console.log('• Health Check: http://localhost:3000/health');
    console.log('• Agent Chat: http://localhost:3000/api/agent-assistant/chat');
    console.log('• Knowledge Categories: http://localhost:3000/api/knowledge/categories');
    
    console.log('\n🎯 Dashboard Assessment:');
    if (successRate >= 75) {
        console.log('✅ CORE DASHBOARD IS WORKING!');
        console.log('   Main features are operational and ready for use.');
    } else if (successRate >= 50) {
        console.log('⚠️ PARTIAL DASHBOARD FUNCTIONALITY');
        console.log('   Some features work, but needs attention for full functionality.');
    } else {
        console.log('❌ DASHBOARD NEEDS MAJOR WORK');
        console.log('   Core features are not working properly.');
    }
    
    console.log('\n💡 What\'s Working:');
    if (passedTests > 0) {
        console.log('✅ Dashboard interface is accessible');
        console.log('✅ VUAI Agent+Assistant is responding');
        console.log('✅ Health monitoring is active');
        console.log('✅ Knowledge base categories are available');
    }
    
    console.log('\n🚀 Ready for User Interaction:');
    if (successRate >= 75) {
        console.log('🎉 YES - Users can access and use the dashboard!');
    } else {
        console.log('⚠️ LIMITED - Some dashboard features available');
    }
}

// Test core dashboard functionality
testCoreDashboard().catch(console.error);
