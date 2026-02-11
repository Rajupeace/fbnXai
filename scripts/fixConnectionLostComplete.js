// VUAI Agent Connection Lost Fix - Complete Solution
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.log('🔧 VUAI Agent Connection Lost Fix');
console.log('=================================\n');

// Function to test server health
const testServerHealth = async (port = 5000) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 3000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const health = JSON.parse(data);
                        resolve({
                            success: true,
                            status: 'healthy',
                            data: health
                        });
                    } catch (error) {
                        resolve({
                            success: false,
                            status: 'invalid_response',
                            error: 'Invalid JSON'
                        });
                    }
                } else {
                    resolve({
                        success: false,
                        status: 'error',
                        code: res.statusCode
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                status: 'connection_error',
                error: error.message
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                status: 'timeout',
                error: 'Request timeout'
            });
        });
        
        req.end();
    });
};

// Function to kill all processes on port
const killProcessesOnPort = async (port) => {
    return new Promise((resolve) => {
        console.log(`🔌 Finding processes on port ${port}...`);
        
        const netstat = spawn('netstat', ['-ano', '|', 'findstr', `:${port}`]);
        let output = '';
        
        netstat.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        netstat.on('close', async (code) => {
            const lines = output.split('\n');
            const pids = new Set();
            
            for (const line of lines) {
                if (line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid)) {
                        pids.add(pid);
                    }
                }
            }
            
            if (pids.size > 0) {
                console.log(`🔌 Found ${pids.size} processes to terminate...`);
                for (const pid of pids) {
                    console.log(`🔌 Terminating process ${pid}...`);
                    const kill = spawn('taskkill', ['/PID', pid, '/F']);
                    await new Promise(resolveKill => kill.on('close', resolveKill));
                }
                console.log('✅ All processes terminated');
            } else {
                console.log('✅ No processes found on port');
            }
            
            resolve(pids.size);
        });
    });
};

// Function to start server with proper configuration
const startServer = () => {
    return new Promise((resolve, reject) => {
        console.log('🚀 Starting VUAI Agent Server...');
        
        const serverProcess = spawn('node', ['serverAdvanced.js'], {
            cwd: path.join(__dirname, 'backend'),
            stdio: ['inherit', 'pipe', 'pipe'],
            shell: true,
            env: {
                ...process.env,
                NODE_ENV: 'development',
                PORT: 5000,
                RATE_LIMIT_MAX: 1000,
                RATE_LIMIT_WINDOW_MS: 60000
            }
        });
        
        let serverStarted = false;
        let startupTimeout;
        
        // Handle server output
        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);
            
            if (output.includes('Server Started Successfully') && !serverStarted) {
                serverStarted = true;
                clearTimeout(startupTimeout);
                resolve(serverProcess);
            }
        });
        
        serverProcess.stderr.on('data', (data) => {
            const output = data.toString();
            console.error(output);
        });
        
        serverProcess.on('error', (error) => {
            clearTimeout(startupTimeout);
            console.error('❌ Server start error:', error.message);
            reject(error);
        });
        
        serverProcess.on('close', (code) => {
            clearTimeout(startupTimeout);
            if (code !== 0 && !serverStarted) {
                console.error(`❌ Server exited with code ${code}`);
                reject(new Error(`Server exited with code ${code}`));
            }
        });
        
        // Set timeout for server startup
        startupTimeout = setTimeout(() => {
            if (!serverStarted) {
                serverProcess.kill();
                reject(new Error('Server startup timeout'));
            }
        }, 15000);
    });
};

// Function to verify server is working
const verifyServer = async () => {
    console.log('🔍 Verifying server functionality...');
    
    // Test health endpoint
    const healthTest = await testServerHealth();
    
    if (healthTest.success) {
        console.log('✅ Health check passed');
        console.log(`🔌 Database: ${healthTest.data.database?.status || 'Unknown'}`);
        console.log(`💾 Memory: ${healthTest.data.server?.memory?.heapUsed || 'Unknown'}`);
        console.log(`📊 Requests: ${healthTest.data.metrics?.totalRequests || 0}`);
        return true;
    } else {
        console.log('❌ Health check failed');
        console.log(`🔍 Error: ${healthTest.error}`);
        return false;
    }
};

// Function to create a simple test client
const createTestClient = () => {
    console.log('🧪 Creating test client...');
    
    const testData = {
        message: 'hello',
        context: { test: true }
    };
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ultra-fast',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(testData))
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const response = JSON.parse(data);
                    console.log('✅ Test client successful');
                    console.log(`⚡ Response: ${response.response}`);
                    console.log(`🕐 Time: ${response.responseTime}ms`);
                    console.log(`🔄 Source: ${response.source}`);
                } catch (error) {
                    console.log('❌ Test client failed: Invalid response');
                }
            } else {
                console.log(`❌ Test client failed: ${res.statusCode}`);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Test client error:', error.message);
    });
    
    req.write(JSON.stringify(testData));
    req.end();
};

// Main fix function
const fixConnectionLost = async () => {
    console.log('🔧 Starting VUAI Agent Connection Lost Fix...\n');
    
    try {
        // Step 1: Kill existing processes
        console.log('1. Cleaning up existing processes...');
        const killedProcesses = await killProcessesOnPort(5000);
        
        // Step 2: Wait for cleanup
        console.log('2. Waiting for cleanup...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 3: Start fresh server
        console.log('3. Starting fresh server...');
        const serverProcess = await startServer();
        
        // Step 4: Wait for server to fully start
        console.log('4. Waiting for server to fully start...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 5: Verify server is working
        console.log('5. Verifying server functionality...');
        const isWorking = await verifyServer();
        
        if (isWorking) {
            console.log('\n🎉 Connection Lost Issue Fixed!');
            console.log('================================');
            console.log('✅ Server is running and healthy');
            console.log('🌐 Server: http://localhost:5000');
            console.log('📊 Health: http://localhost:5000/health');
            console.log('⚡ Ultra-Fast: http://localhost:5000/api/ultra-fast');
            console.log('🔧 Metrics: http://localhost:5000/api/metrics');
            
            // Step 6: Test with client
            console.log('\n6. Testing with client...');
            setTimeout(() => {
                createTestClient();
            }, 1000);
            
        } else {
            console.log('\n❌ Fix failed - Server not responding properly');
            console.log('🔧 Manual troubleshooting required:');
            console.log('1. Check MongoDB service: mongod --version');
            console.log('2. Start MongoDB: mongod --dbpath /data/db');
            console.log('3. Check firewall: Allow port 5000');
            console.log('4. Restart computer');
            console.log('5. Check for antivirus blocking');
        }
        
    } catch (error) {
        console.error('\n❌ Fix failed with error:', error.message);
        console.log('🔧 Alternative solutions:');
        console.log('1. Use different port: PORT=5001 node serverAdvanced.js');
        console.log('2. Check MongoDB connection');
        console.log('3. Verify Node.js installation');
        console.log('4. Check system resources');
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Fix process terminated');
    process.exit(0);
});

// Run the fix
fixConnectionLost().catch(console.error);
