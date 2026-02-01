const http = require('http');

// Test VUAI Agent Chat Response
const testMessages = [
    { message: "hello", userId: "test_user_1" },
    { message: "help", userId: "test_user_2" },
    { message: "tell me about electrical engineering", userId: "test_user_3" },
    { message: "calculate 15 * 8", userId: "test_user_4" },
    { message: "urgent help needed", userId: "test_user_5" }
];

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

async function testVUAIResponses() {
    console.log('🤖 Testing VUAI Agent Chat Responses');
    console.log('=====================================\n');
    
    for (let i = 0; i < testMessages.length; i++) {
        const test = testMessages[i];
        console.log(`${i + 1}. Testing: "${test.message}"`);
        
        // Try different endpoints
        const endpoints = [
            { path: '/api/chat', name: 'Enhanced Chat' },
            { path: '/api/agent-assistant/chat', name: 'Agent Assistant' }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const options = {
                    hostname: 'localhost',
                    port: 3000,
                    path: endpoint.path,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                const result = await makeRequest(options, test);
                
                if (result.success) {
                    console.log(`   ✅ ${endpoint.name}: ${result.status} (${result.responseTime}ms)`);
                    console.log(`      💬 Response: ${result.data.response ? result.data.response.substring(0, 100) + '...' : 'No response'}`);
                    console.log(`      📊 Source: ${result.data.source || 'Unknown'}`);
                    console.log(`      ⚡ Fast: ${result.data.fast || result.data.responseTime < 50 ? 'Yes' : 'No'}`);
                } else {
                    console.log(`   ❌ ${endpoint.name}: ${result.status} (${result.responseTime}ms)`);
                    console.log(`      Error: ${result.data || result.error}`);
                }
            } catch (error) {
                console.log(`   ❌ ${endpoint.name}: Failed (${error.responseTime}ms) - ${error.error}`);
            }
        }
        
        console.log('');
    }
    
    // Test health endpoint
    console.log('🏥 Testing Health Endpoint:');
    try {
        const healthOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/health',
            method: 'GET'
        };
        
        const healthResult = await makeRequest(healthOptions);
        
        if (healthResult.success) {
            console.log(`   ✅ Health: ${healthResult.status} (${healthResult.responseTime}ms)`);
            console.log(`   📊 Status: ${healthResult.data.status}`);
            console.log(`   🔧 Features: ${Object.keys(healthResult.data.features).length} active`);
            console.log(`   🗄️ Database: ${healthResult.data.database.status}`);
        } else {
            console.log(`   ❌ Health: Failed`);
        }
    } catch (error) {
        console.log(`   ❌ Health: Error - ${error.error}`);
    }
    
    console.log('\n🎯 VUAI Agent Response Test Completed!');
    console.log('=====================================\n');
    
    console.log('💡 Summary:');
    console.log('• Check if responses are fast (<50ms)');
    console.log('• Verify LLM and LangChain integration');
    console.log('• Confirm knowledge base access');
    console.log('• Test emergency response capabilities');
}

// Run the test
testVUAIResponses().catch(console.error);
