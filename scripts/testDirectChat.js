const http = require('http');

// Direct test of VUAI Agent Assistant Chat
const testData = {
    message: "hello",
    userId: "test_user_direct"
};

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/agent-assistant/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(testData))
    }
};

const req = http.request(options, (res) => {
    console.log('🤖 VUAI Agent Chat Response Test');
    console.log('=================================\n');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);
    
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        console.log('Response Body:');
        console.log(body);
        
        try {
            const jsonData = JSON.parse(body);
            console.log('\n✅ Parsed JSON Response:');
            console.log('========================');
            console.log(`Success: ${jsonData.success}`);
            console.log(`Response: ${jsonData.response}`);
            console.log(`Source: ${jsonData.source}`);
            console.log(`Response Time: ${jsonData.responseTime}ms`);
            console.log(`Timestamp: ${jsonData.timestamp}`);
            
            // Response quality assessment
            console.log('\n🎯 Response Quality Assessment:');
            console.log('===============================');
            
            if (jsonData.success) {
                console.log('✅ Request Successful');
                
                if (jsonData.responseTime < 50) {
                    console.log('⚡ Response Time: EXCELLENT (<50ms)');
                } else if (jsonData.responseTime < 100) {
                    console.log('📊 Response Time: GOOD (<100ms)');
                } else {
                    console.log('⏳ Response Time: SLOW (>100ms)');
                }
                
                if (jsonData.response && jsonData.response.length > 50) {
                    console.log('💬 Response Length: GOOD');
                } else {
                    console.log('💬 Response Length: SHORT');
                }
                
                if (jsonData.source && jsonData.source !== 'unknown') {
                    console.log('🔍 Source Identified: GOOD');
                } else {
                    console.log('🔍 Source: NOT IDENTIFIED');
                }
                
                console.log('\n🚀 VUAI Agent Status: WORKING');
            } else {
                console.log('❌ Request Failed');
                console.log('🚨 VUAI Agent Status: NEEDS ATTENTION');
            }
            
        } catch (error) {
            console.log('\n❌ JSON Parse Error:');
            console.log(`Error: ${error.message}`);
            console.log('🚨 VUAI Agent Status: MALFORMED RESPONSE');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
    console.log('🚨 VUAI Agent Status: CONNECTION FAILED');
});

req.write(JSON.stringify(testData));
req.end();
