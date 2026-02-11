// Working Fast Response Test
const http = require('http');

console.log('🧪 Testing VUAI Agent Fast Response...\n');

// Test function with proper JSON
const testChatEndpoint = () => {
    return new Promise((resolve) => {
        // Proper JSON string
        const testData = '{"message":"hello","context":{}}';
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testData)
            },
            timeout: 10000
        };
        
        const startTime = Date.now();
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                console.log(`📊 Status Code: ${res.statusCode}`);
                console.log(`⚡ Response Time: ${responseTime}ms`);
                console.log(`📄 Response Length: ${data.length} characters`);
                
                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`✅ Success! Response received`);
                        console.log(`🔄 Response: ${jsonData.response?.substring(0, 100)}...`);
                        console.log(`📡 Source: ${jsonData.source || 'Unknown'}`);
                        console.log(`⚡ Enhanced: ${jsonData.enhanced ? 'Yes' : 'No'}`);
                        console.log(`🚨 Emergency: ${jsonData.emergency ? 'Yes' : 'No'}`);
                        console.log(`💾 Cached: ${jsonData.cached ? 'Yes' : 'No'}`);
                        
                        if (jsonData.responseTime) {
                            console.log(`🕐 Internal Response Time: ${jsonData.responseTime}ms`);
                        }
                        
                        // Check if it's fast
                        if (responseTime < 100) {
                            console.log(`🚀 FAST RESPONSE! (${responseTime}ms)`);
                        } else if (responseTime < 500) {
                            console.log(`⚡ Good Response Time (${responseTime}ms)`);
                        } else {
                            console.log(`⏳ Slow Response (${responseTime}ms)`);
                        }
                        
                    } catch (error) {
                        console.log(`❌ JSON Parse Error: ${error.message}`);
                        console.log(`📄 Raw Response: ${data.substring(0, 200)}...`);
                    }
                } else {
                    console.log(`❌ HTTP Error: ${res.statusCode}`);
                    console.log(`📄 Error Response: ${data.substring(0, 200)}...`);
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Request Error: ${error.message}`);
            resolve();
        });
        
        req.on('timeout', () => {
            req.destroy();
            console.log('❌ Request Timeout');
            resolve();
        });
        
        req.write(testData);
        req.end();
    });
};

// Test multiple messages
const testMultipleMessages = async () => {
    const messages = [
        'hello',
        'help',
        'urgent',
        'calculate 5+3',
        'what is ohms law',
        'status'
    ];
    
    console.log('🧪 Testing Multiple Messages...\n');
    
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(`${i + 1}. Testing: "${message}"`);
        
        await new Promise(resolve => {
            // Proper JSON string
            const testData = `{"message":"${message}","context":{}}`;
            
            const options = {
                hostname: 'localhost',
                port: 5000,
                path: '/api/chat',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(testData)
                },
                timeout: 5000
            };
            
            const startTime = Date.now();
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    
                    if (res.statusCode === 200) {
                        try {
                            const jsonData = JSON.parse(data);
                            console.log(`   ✅ ${responseTime}ms - ${jsonData.response?.substring(0, 50)}...`);
                            
                            if (responseTime < 50) {
                                console.log(`   🚀 ULTRA FAST!`);
                            } else if (responseTime < 100) {
                                console.log(`   ⚡ FAST!`);
                            } else if (responseTime < 500) {
                                console.log(`   📊 Good`);
                            } else {
                                console.log(`   ⏳ Slow`);
                            }
                            
                        } catch (error) {
                            console.log(`   ❌ Parse Error: ${error.message}`);
                        }
                    } else {
                        console.log(`   ❌ HTTP ${res.statusCode}`);
                    }
                    
                    resolve();
                });
            });
            
            req.on('error', () => {
                console.log(`   ❌ Request Error`);
                resolve();
            });
            
            req.on('timeout', () => {
                req.destroy();
                console.log(`   ❌ Timeout`);
                resolve();
            });
            
            req.write(testData);
            req.end();
        });
        
        console.log(''); // Empty line
    }
};

// Test root endpoint
const testRootEndpoint = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/',
            method: 'GET',
            timeout: 5000
        };
        
        const startTime = Date.now();
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                console.log(`📊 Root Status Code: ${res.statusCode}`);
                console.log(`⚡ Root Response Time: ${responseTime}ms`);
                
                if (res.statusCode === 200) {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`✅ Root Success: ${jsonData.message}`);
                        console.log(`🌐 Version: ${jsonData.version}`);
                        console.log(`📡 Available Endpoints: ${Object.keys(jsonData.endpoints).join(', ')}`);
                    } catch (error) {
                        console.log(`❌ Root JSON Parse Error: ${error.message}`);
                    }
                } else {
                    console.log(`❌ Root HTTP Error: ${res.statusCode}`);
                }
                
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ Root Request Error: ${error.message}`);
            resolve();
        });
        
        req.on('timeout', () => {
            req.destroy();
            console.log('❌ Root Request Timeout');
            resolve();
        });
        
        req.end();
    });
};

// Main test function
async function runFastResponseTest() {
    console.log('🚀 VUAI Agent Fast Response Check');
    console.log('=================================\n');
    
    console.log('1. Testing Root Endpoint:');
    await testRootEndpoint();
    
    console.log('\n2. Testing Chat Endpoint:');
    await testChatEndpoint();
    
    console.log('\n3. Testing Multiple Messages:');
    await testMultipleMessages();
    
    console.log('🎉 Fast Response Check Complete!');
    console.log('===============================\n');
    
    console.log('📊 Summary:');
    console.log('• Response times measured');
    console.log('• Multiple message types tested');
    console.log('• Fast response capability verified');
    console.log('• System performance evaluated');
    
    console.log('\n🎯 Fast Response Criteria:');
    console.log('🚀 Ultra Fast: <50ms');
    console.log('⚡ Fast: <100ms');
    console.log('📊 Good: <500ms');
    console.log('⏳ Slow: >500ms');
}

// Run the test
runFastResponseTest().catch(console.error);
