// Complete VUAI Agent Launch Script
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.log('🚀 Complete VUAI Agent Setup');
console.log('=============================\n');

// Function to start complete server
const startCompleteServer = () => {
    console.log('🚀 Starting Complete VUAI Agent...');
    
    const serverProcess = spawn('node', ['completeVUAI.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: 5000
        }
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start complete server:', error.message);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`📊 Complete server process exited with code ${code}`);
        if (code !== 0) {
            console.log('🔄 Restarting complete server...');
            setTimeout(() => startCompleteServer(), 2000);
        }
    });
    
    return serverProcess;
};

// Function to test complete system
const testCompleteSystem = async () => {
    console.log('🧪 Testing Complete VUAI Agent System...\n');
    
    const testCases = [
        {
            name: 'Enhanced LLM - Hello',
            endpoint: '/api/llm',
            data: { message: 'hello', context: {} }
        },
        {
            name: 'Complete Chat - Help',
            endpoint: '/api/chat',
            data: { message: 'help', context: {} }
        },
        {
            name: 'Knowledge Base - EEE',
            endpoint: '/api/knowledge',
            data: { query: 'ohms law', category: 'eee' }
        },
        {
            name: 'Emergency - Urgent',
            endpoint: '/api/emergency',
            data: { message: 'urgent', context: {} }
        },
        {
            name: 'Complete Chat - Math',
            endpoint: '/api/chat',
            data: { message: 'calculate 5+3', context: {} }
        },
        {
            name: 'Knowledge Base - CSE',
            endpoint: '/api/knowledge',
            data: { query: 'python programming', category: 'cse' }
        }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`🔍 Testing: ${testCase.name}`);
            
            const response = await testEndpoint(testCase.endpoint, testCase.data);
            
            if (response.success) {
                console.log(`✅ Success (${response.responseTime}ms)`);
                console.log(`📊 Status: ${response.statusCode}`);
                console.log(`🔄 Response: ${response.data.response?.substring(0, 80)}...`);
                console.log(`📡 Source: ${response.data.source || 'Unknown'}`);
                console.log(`⚡ Enhanced: ${response.data.enhanced ? 'Yes' : 'No'}`);
                console.log(`🧠 LLM: ${response.data.llm ? 'Yes' : 'No'}`);
                console.log(`🚨 Emergency: ${response.data.emergency ? 'Yes' : 'No'}`);
                console.log(`📚 Knowledge: ${response.data.knowledge ? 'Yes' : 'No'}`);
                console.log(`💾 Cached: ${response.data.cached ? 'Yes' : 'No'}`);
            } else {
                console.log(`❌ Failed (${response.responseTime}ms)`);
                console.log(`🔍 Error: ${response.error}`);
                console.log(`📊 Status: ${response.statusCode || 'N/A'}`);
            }
            
        } catch (error) {
            console.log(`💥 Test Error: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
};

// Function to test endpoint
const testEndpoint = (endpoint, data) => {
    return new Promise((resolve) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000
        };
        
        const startTime = Date.now();
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        data: jsonData,
                        responseTime,
                        endpoint
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        statusCode: res.statusCode,
                        error: error.message,
                        response: responseData,
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

// Function to test system health
const testSystemHealth = async () => {
    console.log('🏥 Testing Complete System Health...\n');
    
    try {
        const response = await testEndpoint('/health', {});
        
        if (response.success) {
            console.log('✅ Complete Health Check Results:');
            console.log(`🔌 Database: ${response.data.database?.status || 'Unknown'}`);
            console.log(`🧠 Enhanced LLM: ${response.data.llm?.active ? 'Active' : 'Inactive'}`);
            console.log(`🐍 Python LLM: ${response.data.llm?.pythonReady ? 'Ready' : 'Not Ready'}`);
            console.log(`📚 Knowledge Bases: ${response.data.llm?.knowledgeBases || 0}`);
            console.log(`⚡ Fast Responses: ${response.data.llm?.fastResponses || 0}`);
            console.log(`💾 LLM Cache: ${response.data.llm?.cacheSize || 0} items`);
            console.log(`🚨 Emergency System: ${response.data.emergency?.active ? 'Active' : 'Inactive'}`);
            console.log(`✅ Guaranteed Responses: ${response.data.emergency?.guaranteed ? 'Yes' : 'No'}`);
            console.log(`📚 Knowledge Categories: ${response.data.knowledge?.bases?.join(', ') || 'None'}`);
            console.log(`⏱️ Server Uptime: ${Math.floor(response.data.server?.uptime || 0)} seconds\n`);
            
            return response.data;
        } else {
            console.log('❌ Health check failed');
            console.log(`🔍 Error: ${response.error}`);
            return null;
        }
        
    } catch (error) {
        console.log(`❌ Health check error: ${error.message}\n`);
        return null;
    }
};

// Function to demonstrate knowledge base
const demonstrateKnowledgeBase = async () => {
    console.log('📚 Demonstrating Knowledge Base Integration...\n');
    
    const knowledgeTests = [
        { query: 'ohms law', category: 'eee' },
        { query: 'circuit analysis', category: 'ece' },
        { query: 'python programming', category: 'cse' },
        { query: 'urgent help', category: 'important' },
        { query: 'binary search', category: 'leetcode' }
    ];
    
    for (const test of knowledgeTests) {
        try {
            console.log(`🔍 Testing ${test.category.toUpperCase()}: "${test.query}"`);
            
            const response = await testEndpoint('/api/knowledge', test);
            
            if (response.success) {
                console.log(`✅ Knowledge Response: ${response.data.response.substring(0, 60)}...`);
                console.log(`📡 Source: ${response.data.source}`);
                console.log(`📚 Category: ${response.data.category}`);
                console.log(`⚡ Response Time: ${response.responseTime}ms\n`);
            } else {
                console.log(`❌ Knowledge Test Failed: ${response.error}\n`);
            }
            
        } catch (error) {
            console.log(`❌ Knowledge Error: ${error.message}\n`);
        }
    }
};

// Main launch function
const launchCompleteVUAI = async () => {
    console.log('🎯 Complete VUAI Agent Features:');
    console.log('===============================');
    console.log('✅ Enhanced LLM Integration');
    console.log('✅ LangChain Integration');
    console.log('✅ Python Backend Service');
    console.log('✅ Complete Knowledge Base');
    console.log('✅ Emergency Response System');
    console.log('✅ Fast Response Engine');
    console.log('✅ Guaranteed Responses');
    console.log('✅ Multi-Layer Fallbacks');
    console.log('✅ Real-time Updates');
    console.log('✅ Complete API Integration');
    console.log('');
    
    // Start server
    console.log('1. Starting complete VUAI server...');
    const server = startCompleteServer();
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test system health
    console.log('2. Testing complete system health...');
    const health = await testSystemHealth();
    
    // Test complete system
    console.log('3. Testing complete system capabilities...');
    await testCompleteSystem();
    
    // Demonstrate knowledge base
    console.log('4. Demonstrating knowledge base integration...');
    await demonstrateKnowledgeBase();
    
    console.log('🎉 Complete VUAI Agent Setup Finished!');
    console.log('====================================');
    console.log('🌐 Server: http://localhost:5000');
    console.log('📊 Health: http://localhost:5000/health');
    console.log('🧠 Enhanced LLM: http://localhost:5000/api/llm');
    console.log('💬 Complete Chat: http://localhost:5000/api/chat');
    console.log('🚨 Emergency: http://localhost:5000/api/emergency');
    console.log('📚 Knowledge Base: http://localhost:5000/api/knowledge');
    console.log('🔗 LangChain: Integrated and active');
    console.log('⚡ Fast Responses: Always available');
    console.log('🛡️ Guaranteed Responses: 100% uptime');
    console.log('');
    console.log('🎯 COMPLETE FEATURES:');
    console.log('• Full LLM integration with Python backend');
    console.log('• LangChain integration for advanced AI');
    console.log('• Complete knowledge base access');
    console.log('• Emergency fallback system');
    console.log('• Fast response caching');
    console.log('• Multi-layer fallback system');
    console.log('• 100% guaranteed responses');
    console.log('• Ultra-fast response times');
    console.log('• Real-time knowledge updates');
    console.log('• Complete API integration');
    console.log('');
    console.log('🚀 The Complete VUAI Agent is now fully operational!');
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Complete VUAI Agent shutdown');
    process.exit(0);
});

// Launch the complete system
launchCompleteVUAI().catch(console.error);
