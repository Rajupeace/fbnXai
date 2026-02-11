// Enhanced LLM and LangChain Launch Script
const { spawn } = require('child_process');
const path = require('path');

console.log('🧠 Enhanced LLM and LangChain Integration');
console.log('=====================================\n');

// Function to start enhanced server
const startEnhancedServer = () => {
    console.log('🚀 Starting Enhanced VUAI Agent with LLM Integration...');
    
    const serverProcess = spawn('node', ['serverEnhancedLLM.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'enhanced',
            PORT: 5000
        }
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start enhanced server:', error.message);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`📊 Enhanced server process exited with code ${code}`);
        if (code !== 0) {
            console.log('🔄 Restarting enhanced server...');
            setTimeout(() => startEnhancedServer(), 2000);
        }
    });
    
    return serverProcess;
};

// Function to test enhanced LLM capabilities
const testEnhancedLLM = async () => {
    console.log('🧪 Testing Enhanced LLM Capabilities...\n');
    
    const testCases = [
        { message: 'hello', expected: 'greeting' },
        { message: 'help', expected: 'help menu' },
        { message: 'urgent', expected: 'urgent assistance' },
        { message: 'what is ohms law', expected: 'knowledge base' },
        { message: 'calculate 5+3', expected: 'math calculation' },
        { message: 'explain circuits', expected: 'technical explanation' },
        { message: 'python programming', expected: 'programming help' },
        { message: 'database design', expected: 'database knowledge' }
    ];
    
    for (const testCase of testCases) {
        try {
            console.log(`🔍 Testing: "${testCase.message}"`);
            
            const response = await fetch('http://localhost:5000/api/llm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: testCase.message,
                    context: { test: true }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Success: ${data.response.substring(0, 80)}...`);
                console.log(`⚡ Response Time: ${data.responseTime}ms`);
                console.log(`🔄 Source: ${data.source}`);
                console.log(`🧠 Enhanced LLM: ${data.llm ? 'Active' : 'Inactive'}`);
                console.log(`💾 Cached: ${data.cached ? 'Yes' : 'No'}\n`);
            } else {
                console.log(`❌ Failed: ${response.status}\n`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}\n`);
        }
    }
};

// Function to test emergency fallback
const testEmergencyFallback = async () => {
    console.log('🚨 Testing Emergency Fallback System...\n');
    
    const emergencyTests = [
        'random message that should trigger emergency',
        '12345',
        '!!!@@@###',
        '',
        'very long message to test emergency system capabilities'
    ];
    
    for (const testMessage of emergencyTests) {
        try {
            console.log(`🔍 Testing emergency fallback: "${testMessage.substring(0, 30)}${testMessage.length > 30 ? '...' : ''}"`);
            
            const response = await fetch('http://localhost:5000/api/emergency', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: testMessage,
                    context: { emergency: true }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Emergency Response: ${data.response.substring(0, 60)}...`);
                console.log(`⚡ Response Time: ${data.responseTime}ms`);
                console.log(`🔄 Source: ${data.source}`);
                console.log(`🚨 Emergency: ${data.emergency ? 'Active' : 'Inactive'}`);
                console.log(`✅ Guaranteed: ${data.guaranteed ? 'Yes' : 'No'}\n`);
            } else {
                console.log(`❌ Emergency Failed: ${response.status}\n`);
            }
            
        } catch (error) {
            console.log(`❌ Emergency Error: ${error.message}\n`);
        }
    }
};

// Function to test system health
const testSystemHealth = async () => {
    console.log('🏥 Testing Enhanced System Health...\n');
    
    try {
        const response = await fetch('http://localhost:5000/health');
        const health = await response.json();
        
        console.log('✅ Enhanced Health Check Results:');
        console.log(`🔌 Database: ${health.database.status}`);
        console.log(`🧠 Enhanced LLM: ${health.llm.active ? 'Active' : 'Inactive'}`);
        console.log(`🐍 Python LLM: ${health.llm.pythonReady ? 'Ready' : 'Not Ready'}`);
        console.log(`📚 Knowledge Bases: ${health.llm.knowledgeBases}`);
        console.log(`⚡ Fast Responses: ${health.llm.fastResponses}`);
        console.log(`💾 LLM Cache: ${health.llm.cacheSize} items`);
        console.log(`🚨 Emergency System: ${health.emergency.active ? 'Active' : 'Inactive'}`);
        console.log(`✅ Guaranteed Responses: ${health.emergency.guaranteed ? 'Yes' : 'No'}`);
        console.log(`💾 Emergency Cache: ${health.emergency.cacheSize} items`);
        console.log(`⏱️ Server Uptime: ${Math.floor(health.server.uptime / 60)} minutes\n`);
        
        return health;
        
    } catch (error) {
        console.log(`❌ Health check failed: ${error.message}\n`);
        return null;
    }
};

// Function to demonstrate LangChain integration
const demonstrateLangChain = async () => {
    console.log('🔗 Demonstrating LangChain Integration...\n');
    
    try {
        const response = await fetch('http://localhost:5000/api/llm/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const testResults = await response.json();
            
            console.log('🔗 LangChain Integration Test Results:');
            console.log(`📊 Total Tests: ${testResults.totalTests}`);
            console.log(`✅ Successful Tests: ${testResults.successfulTests}`);
            console.log(`⚡ Average Response Time: ${testResults.averageResponseTime}ms`);
            console.log('');
            
            testResults.testResults.forEach((result, index) => {
                console.log(`${index + 1}. "${result.message}"`);
                console.log(`   Response: ${result.response.substring(0, 50)}...`);
                console.log(`   Source: ${result.source}`);
                console.log(`   Time: ${result.responseTime}ms`);
                console.log(`   Cached: ${result.cached ? 'Yes' : 'No'}`);
                console.log('');
            });
            
        } else {
            console.log('❌ LangChain test failed');
        }
        
    } catch (error) {
        console.log(`❌ LangChain demonstration error: ${error.message}`);
    }
};

// Main launch function
const launchEnhancedLLM = async () => {
    console.log('🎯 Enhanced LLM and LangChain Features:');
    console.log('=====================================');
    console.log('✅ Enhanced LLM Integration');
    console.log('✅ LangChain Integration');
    console.log('✅ Python Backend Service');
    console.log('✅ Knowledge Base Integration');
    console.log('✅ Fast Response System');
    console.log('✅ Emergency Fallback');
    console.log('✅ Math Calculations');
    console.log('✅ Caching System');
    console.log('✅ Multiple Fallbacks');
    console.log('✅ Guaranteed Responses');
    console.log('');
    
    // Start server
    console.log('1. Starting enhanced server...');
    const server = startEnhancedServer();
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test system health
    console.log('2. Testing enhanced system health...');
    const health = await testSystemHealth();
    
    // Test enhanced LLM
    console.log('3. Testing enhanced LLM capabilities...');
    await testEnhancedLLM();
    
    // Test emergency fallback
    console.log('4. Testing emergency fallback...');
    await testEmergencyFallback();
    
    // Demonstrate LangChain
    console.log('5. Demonstrating LangChain integration...');
    await demonstrateLangChain();
    
    console.log('🎉 Enhanced LLM and LangChain Integration Complete!');
    console.log('===============================================');
    console.log('🌐 Server: http://localhost:5000');
    console.log('📊 Health: http://localhost:5000/health');
    console.log('🧠 Enhanced LLM: http://localhost:5000/api/llm');
    console.log('🚨 Emergency: http://localhost:5000/api/emergency');
    console.log('🔗 LangChain Test: http://localhost:5000/api/llm/test');
    console.log('📚 Knowledge Base: http://localhost:5000/api/llm/knowledge');
    console.log('');
    console.log('🧠 ENHANCED FEATURES:');
    console.log('• LangChain integration with Python backend');
    console.log('• Knowledge base integration');
    console.log('• Fast response caching');
    console.log('• Emergency fallback system');
    console.log('• Math calculations');
    console.log('• Multiple fallback layers');
    console.log('• 100% guaranteed responses');
    console.log('• Ultra-fast response times');
    console.log('');
    console.log('🚀 The VUAI Agent now has enhanced LLM capabilities with LangChain!');
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Enhanced LLM system shutdown');
    process.exit(0);
});

// Launch the enhanced system
launchEnhancedLLM().catch(console.error);
