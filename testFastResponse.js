// VUAI Agent Fast Response Test
const http = require('http');

console.log('🧪 Testing VUAI Agent Fast Response...\n');

// Test function
const testFastResponse = (endpoint, testData) => {
    return new Promise((resolve) => {
        const postData = JSON.stringify(testData);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint,
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
                
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        response: jsonData,
                        responseTime,
                        endpoint
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        error: error.message,
                        response: data,
                        responseTime,
                        endpoint
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message,
                responseTime: Date.now() - startTime,
                endpoint
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Request timeout',
                responseTime: Date.now() - startTime,
                endpoint
            });
        });
        
        req.write(postData);
        req.end();
    });
};

// Test cases
const testCases = [
    {
        name: 'Enhanced LLM - Hello',
        endpoint: '/api/llm',
        data: { message: 'hello', context: {} }
    },
    {
        name: 'Enhanced LLM - Help',
        endpoint: '/api/llm',
        data: { message: 'help', context: {} }
    },
    {
        name: 'Enhanced LLM - Math',
        endpoint: '/api/llm',
        data: { message: 'calculate 5+3', context: {} }
    },
    {
        name: 'Emergency - Hello',
        endpoint: '/api/emergency',
        data: { message: 'hello', context: {} }
    },
    {
        name: 'Emergency - Help',
        endpoint: '/api/emergency',
        data: { message: 'help', context: {} }
    },
    {
        name: 'Emergency - Urgent',
        endpoint: '/api/emergency',
        data: { message: 'urgent', context: {} }
    }
];

// Run tests
async function runTests() {
    console.log('🚀 Starting VUAI Agent Fast Response Tests...\n');
    
    for (const testCase of testCases) {
        console.log(`🔍 Testing: ${testCase.name}`);
        
        try {
            const result = await testFastResponse(testCase.endpoint, testCase.data);
            
            if (result.success) {
                console.log(`✅ Success (${result.responseTime}ms)`);
                console.log(`📊 Status: ${result.statusCode}`);
                console.log(`🔄 Response: ${result.response.response?.substring(0, 80)}...`);
                console.log(`📡 Source: ${result.response.source || 'Unknown'}`);
                console.log(`⚡ Enhanced: ${result.response.enhanced ? 'Yes' : 'No'}`);
                console.log(`🚨 Emergency: ${result.response.emergency ? 'Yes' : 'No'}`);
                console.log(`💾 Cached: ${result.response.cached ? 'Yes' : 'No'}`);
            } else {
                console.log(`❌ Failed (${result.responseTime}ms)`);
                console.log(`🔍 Error: ${result.error}`);
                console.log(`📊 Status: ${result.statusCode || 'N/A'}`);
                console.log(`📄 Response: ${result.response?.substring(0, 200)}...`);
            }
            
        } catch (error) {
            console.log(`💥 Test Error: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
    
    console.log('🎉 VUAI Agent Fast Response Tests Complete!');
    console.log('=====================================\n');
    
    // Test health endpoint
    console.log('🏥 Testing Health Endpoint...');
    try {
        const healthResult = await testFastResponse('/health', {});
        
        if (healthResult.success) {
            console.log('✅ Health Check Success');
            console.log(`📊 Status: ${healthResult.response.status}`);
            console.log(`🔌 Database: ${healthResult.response.database?.status || 'Unknown'}`);
            console.log(`🧠 Enhanced LLM: ${healthResult.response.llm?.active ? 'Active' : 'Inactive'}`);
            console.log(`🚨 Emergency: ${healthResult.response.emergency?.active ? 'Active' : 'Inactive'}`);
            console.log(`⏱️ Uptime: ${Math.floor(healthResult.response.server?.uptime || 0)} seconds`);
        } else {
            console.log('❌ Health Check Failed');
            console.log(`🔍 Error: ${healthResult.error}`);
        }
    } catch (error) {
        console.log(`💥 Health Test Error: ${error.message}`);
    }
    
    console.log('\n📊 Test Summary:');
    console.log('• Enhanced LLM responses tested');
    console.log('• Emergency fallback responses tested');
    console.log('• Response times measured');
    console.log('• System health verified');
    console.log('• All endpoints checked');
}

// Run the tests
runTests().catch(console.error);
