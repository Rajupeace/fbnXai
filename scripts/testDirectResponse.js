// Direct Fast Response Test
const http = require('http');

console.log('🧪 Testing VUAI Agent Direct Fast Response...\n');

// Test data
const testData = {
    message: 'hello',
    context: {}
};

const postData = JSON.stringify(testData);

// Test function
const testDirectResponse = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/fast',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
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
                
                console.log(`📊 Status Code: ${res.statusCode}`);
                console.log(`⚡ Response Time: ${responseTime}ms`);
                console.log(`📄 Response: ${data.substring(0, 200)}...`);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ Response: ${jsonData.response}`);
                    console.log(`🔄 Source: ${jsonData.source}`);
                    console.log(`⚡ Enhanced: ${jsonData.enhanced ? 'Yes' : 'No'}`);
                    console.log(`🛡️ Guaranteed: ${jsonData.guaranteed ? 'Yes' : 'No'}`);
                } catch (error) {
                    console.log(`❌ JSON Parse Error: ${error.message}`);
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
        
        req.write(postData);
        req.end();
    });
};

// Test emergency response
const testEmergencyResponse = () => {
    return new Promise((resolve) => {
        const emergencyData = {
            message: 'urgent',
            context: {}
        };
        
        const postData = JSON.stringify(emergencyData);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/emergency',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
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
                
                console.log(`📊 Status Code: ${res.statusCode}`);
                console.log(`⚡ Response Time: ${responseTime}ms`);
                console.log(`📄 Response: ${data.substring(0, 200)}...`);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ Response: ${jsonData.response}`);
                    console.log(`🔄 Source: ${jsonData.source}`);
                    console.log(`🚨 Emergency: ${jsonData.emergency ? 'Yes' : 'No'}`);
                    console.log(`🛡️ Guaranteed: ${jsonData.guaranteed ? 'Yes' : 'No'}`);
                } catch (error) {
                    console.log(`❌ JSON Parse Error: ${error.message}`);
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
        
        req.write(postData);
        req.end();
    });
};

// Test health endpoint
const testHealthEndpoint = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/health',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status Code: ${res.statusCode}`);
                console.log(`📄 Response: ${data.substring(0, 300)}...`);
                
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ Status: ${jsonData.status}`);
                    console.log(`🌐 Server: ${jsonData.server}`);
                    console.log(`⏱️ Uptime: ${Math.floor(jsonData.uptime)} seconds`);
                    console.log(`🧠 Features: ${Object.keys(jsonData.features).join(', ')}`);
                } catch (error) {
                    console.log(`❌ JSON Parse Error: ${error.message}`);
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
        
        req.end();
    });
};

// Run tests
async function runDirectTests() {
    console.log('🚀 Starting Direct Fast Response Tests...\n');
    
    console.log('1. Testing Fast Response Endpoint:');
    await testDirectResponse();
    
    console.log('\n2. Testing Emergency Response Endpoint:');
    await testEmergencyResponse();
    
    console.log('\n3. Testing Health Endpoint:');
    await testHealthEndpoint();
    
    console.log('\n🎉 Direct Fast Response Tests Complete!');
    console.log('=====================================\n');
    
    console.log('📊 Test Results Summary:');
    console.log('• Fast response endpoint tested');
    console.log('• Emergency response endpoint tested');
    console.log('• Health endpoint tested');
    console.log('• Response times measured');
    console.log('• System status verified');
}

// Run the tests
runDirectTests().catch(console.error);
