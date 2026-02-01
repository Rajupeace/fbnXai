const http = require('http');

// Quick comprehensive test of VUAI Agent
const quickTests = [
    {
        name: "Health Check",
        path: "/health",
        method: "GET"
    },
    {
        name: "Dashboard Access",
        path: "/dashboard",
        method: "GET"
    },
    {
        name: "Agent Chat - Hello",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "hello", userId: "test_user" }
    },
    {
        name: "Agent Chat - Help",
        path: "/api/agent-assistant/chat",
        method: "POST",
        payload: { message: "help me learn", userId: "test_user" }
    },
    {
        name: "Knowledge Categories",
        path: "/api/knowledge/categories",
        method: "GET"
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

async function runQuickTest() {
    console.log('⚡ VUAI Agent - Quick Test');
    console.log('==========================\n');
    
    let passedTests = 0;
    let totalTime = 0;
    
    for (let i = 0; i < quickTests.length; i++) {
        const test = quickTests[i];
        console.log(`${i + 1}. ${test.name}`);
        
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
                
                console.log(`   ✅ ${result.status} (${result.responseTime}ms)`);
                
                if (result.data.type === 'html') {
                    console.log(`   🌐 Dashboard loaded`);
                } else if (result.data.response) {
                    console.log(`   💬 ${result.data.response.substring(0, 40)}...`);
                } else if (result.data.categories) {
                    console.log(`   📚 ${result.data.categories.length} categories`);
                } else if (result.data.features) {
                    console.log(`   🔧 ${Object.keys(result.data.features).length} features`);
                }
                
            } else {
                console.log(`   ❌ ${result.status} (${result.responseTime}ms)`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error - ${error.error}`);
        }
        
        console.log('');
    }
    
    // Summary
    console.log('📊 Quick Test Results');
    console.log('====================');
    
    const successRate = (passedTests / quickTests.length) * 100;
    const avgResponseTime = passedTests > 0 ? (totalTime / passedTests) : 0;
    
    console.log(`Tests: ${passedTests}/${quickTests.length} (${successRate.toFixed(1)}%)`);
    console.log(`Avg Response: ${avgResponseTime.toFixed(2)}ms`);
    
    if (successRate >= 80) {
        console.log('🎉 VUAI Agent is WORKING GREAT!');
    } else if (successRate >= 60) {
        console.log('✅ VUAI Agent is WORKING with some issues');
    } else {
        console.log('⚠️ VUAI Agent needs ATTENTION');
    }
    
    console.log('\n🌐 Access Points:');
    console.log('• Dashboard: http://localhost:3000/dashboard');
    console.log('• Health: http://localhost:3000/health');
    console.log('• Chat: http://localhost:3000/api/agent-assistant/chat');
}

// Run quick test
runQuickTest().catch(console.error);
