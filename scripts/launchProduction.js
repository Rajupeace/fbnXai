// VUAI Agent Production Launch Script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 VUAI Agent Production Launch');
console.log('===============================\n');

// Production configuration
const productionConfig = {
    port: process.env.PORT || 5000,
    nodeEnv: 'production',
    maxMemory: '2GB',
    enableCluster: false,
    enableMonitoring: true
};

// Function to start production server
const startProductionServer = () => {
    console.log('🔧 Starting Production VUAI Agent Server...');
    console.log(`🌐 Port: ${productionConfig.port}`);
    console.log(`🔧 Environment: ${productionConfig.nodeEnv}`);
    console.log(`💾 Max Memory: ${productionConfig.maxMemory}`);
    console.log('');
    
    const serverProcess = spawn('node', ['serverAdvanced.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: ['inherit', 'inherit', 'inherit'],
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: productionConfig.nodeEnv,
            PORT: productionConfig.port,
            NODE_OPTIONS: '--max-old-space-size=2048',
            UV_THREADPOOL_SIZE: 128
        },
        detached: false
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start production server:', error.message);
        process.exit(1);
    });
    
    serverProcess.on('close', (code) => {
        if (code !== 0) {
            console.log(`📊 Production server exited with code ${code}`);
            console.log('🔄 Attempting to restart...');
            setTimeout(() => startProductionServer(), 5000);
        } else {
            console.log('📊 Production server stopped gracefully');
        }
    });
    
    // Handle process signals
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT. Shutting down production server...');
        serverProcess.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM. Shutting down production server...');
        serverProcess.kill('SIGTERM');
    });
    
    return serverProcess;
};

// Function to monitor server health
const monitorServerHealth = async () => {
    const healthUrl = `http://localhost:${productionConfig.port}/health`;
    
    const checkHealth = async () => {
        try {
            const response = await fetch(healthUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'VUAI-Monitor/1.0'
                },
                timeout: 10000
            });
            
            if (response.ok) {
                const health = await response.json();
                console.log(`✅ Server Health: ${health.status}`);
                console.log(`🔌 Database: ${health.database.status}`);
                console.log(`💾 Memory: ${health.server.memory.heapUsed}`);
                console.log(`⏱️ Uptime: ${Math.floor(health.server.uptime / 60)}m`);
                console.log(`📊 Requests: ${health.metrics.totalRequests}`);
                console.log(`⚡ Ultra-Fast: ${health.metrics.ultraFastResponses}`);
                console.log('');
            } else {
                console.log(`❌ Health check failed: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ Health check error: ${error.message}`);
        }
    };
    
    // Check health every 30 seconds
    setInterval(checkHealth, 30000);
    
    // Initial health check after server starts
    setTimeout(checkHealth, 5000);
};

// Function to display production status
const displayProductionStatus = () => {
    console.log('🎯 Production Server Status:');
    console.log('===========================');
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
    console.log('✅ Production-Ready Configuration');
    console.log('✅ Memory Optimization');
    console.log('✅ Auto-Restart Capability');
    console.log('');
};

// Main production launch function
const launchProduction = async () => {
    displayProductionStatus();
    
    console.log('1. Starting production server...');
    const server = startProductionServer();
    
    console.log('2. Initializing health monitoring...');
    await monitorServerHealth();
    
    console.log('🎉 VUAI Agent Production Launch Complete!');
    console.log('=========================================');
    console.log('🌐 Server: http://localhost:5000');
    console.log('📊 Health: http://localhost:5000/health');
    console.log('🔧 Metrics: http://localhost:5000/api/metrics');
    console.log('⚡ Ultra-Fast: http://localhost:5000/api/ultra-fast');
    console.log('');
    console.log('🚀 VUAI Agent is running in production mode!');
    console.log('📝 Press Ctrl+C to stop the server');
    console.log('');
    
    // Keep the process running
    console.log('⏳ Monitoring server health...');
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Launch production
launchProduction().catch(console.error);
