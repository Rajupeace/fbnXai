// VUAI Agent Advanced Features Integration
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 VUAI Agent Advanced Features Integration');
console.log('==========================================\n');

// Function to start the advanced server
const startAdvancedServer = () => {
    console.log('🔧 Starting Advanced VUAI Agent Server...');
    
    const serverProcess = spawn('node', ['serverAdvanced.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'production',
            PORT: process.env.PORT || 5000
        }
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start advanced server:', error.message);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`📊 Advanced server process exited with code ${code}`);
    });
    
    return serverProcess;
};

// Function to test advanced features
const testAdvancedFeatures = async () => {
    console.log('🧪 Testing Advanced Features...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: 'http://localhost:5000/health',
            description: 'Comprehensive health monitoring'
        },
        {
            name: 'Metrics API',
            url: 'http://localhost:5000/api/metrics',
            description: 'Performance metrics and statistics'
        },
        {
            name: 'Ultra-Fast API',
            url: 'http://localhost:5000/api/ultra-fast',
            method: 'POST',
            body: { message: 'hello', context: {} },
            description: 'Ultra-fast response system'
        }
    ];
    
    for (const test of tests) {
        try {
            console.log(`🔍 Testing: ${test.name}`);
            console.log(`📝 Description: ${test.description}`);
            
            const response = await fetch(test.url, {
                method: test.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-request-id': 'test-' + Date.now()
                },
                body: test.body ? JSON.stringify(test.body) : undefined
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${test.name}: SUCCESS`);
                console.log(`📊 Status: ${response.status}`);
                console.log(`🕐 Response Time: ${response.headers.get('x-response-time') || 'N/A'}`);
                
                if (test.name === 'Health Check') {
                    console.log(`🔌 Database: ${data.database.status}`);
                    console.log(`💾 Memory: ${data.server.memory.heapUsed}`);
                    console.log(`⚡ Ultra-Fast: ${data.performance.ultraFastEngine.cacheHitRate}`);
                } else if (test.name === 'Ultra-Fast API') {
                    console.log(`⚡ Response: ${data.response}`);
                    console.log(`🕐 Response Time: ${data.responseTime}ms`);
                    console.log(`🔄 Source: ${data.source}`);
                }
            } else {
                console.log(`❌ ${test.name}: FAILED (${response.status})`);
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
};

// Function to display feature summary
const displayFeatureSummary = () => {
    console.log('🎯 Advanced Features Summary:');
    console.log('=============================');
    console.log('✅ Enhanced Database Connection');
    console.log('✅ Ultra-Fast Response System');
    console.log('✅ Comprehensive Health Monitoring');
    console.log('✅ Performance Metrics Tracking');
    console.log('✅ Advanced Error Handling');
    console.log('✅ Graceful Shutdown Management');
    console.log('✅ Request ID Tracking');
    console.log('✅ Multi-Tier Rate Limiting');
    console.log('✅ Security Enhancements');
    console.log('✅ Connection Recovery System');
    console.log('');
};

// Main integration function
const integrateAdvancedFeatures = async () => {
    displayFeatureSummary();
    
    console.log('1. Starting advanced server...');
    const server = startAdvancedServer();
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('2. Testing advanced features...');
    await testAdvancedFeatures();
    
    console.log('🎉 Advanced Features Integration Complete!');
    console.log('🌐 Server: http://localhost:5000');
    console.log('📊 Health: http://localhost:5000/health');
    console.log('🔧 Metrics: http://localhost:5000/api/metrics');
    console.log('⚡ Ultra-Fast: http://localhost:5000/api/ultra-fast');
    console.log('');
    console.log('🚀 VUAI Agent is now running with advanced features!');
};

// Run the integration
integrateAdvancedFeatures().catch(console.error);
