// Connection Lost Diagnosis and Fix Script
const { spawn } = require('child_process');
const http = require('http');

console.log('🔍 VUAI Agent Connection Diagnosis');
console.log('=================================\n');

// Function to test server connectivity
const testServerConnection = async (port = 5000) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/health',
            method: 'GET',
            timeout: 5000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const health = JSON.parse(data);
                    resolve({
                        success: true,
                        status: res.statusCode,
                        health: health
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        error: 'Invalid JSON response',
                        data: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({
                success: false,
                error: 'Request timeout'
            });
        });
        
        req.end();
    });
};

// Function to diagnose connection issues
const diagnoseConnection = async () => {
    console.log('1. Testing server connectivity...');
    
    const connectionTest = await testServerConnection();
    
    if (connectionTest.success) {
        console.log('✅ Server is responding');
        console.log(`📊 Status: ${connectionTest.status}`);
        console.log(`🔌 Database: ${connectionTest.health.database?.status || 'Unknown'}`);
        console.log(`💾 Memory: ${connectionTest.health.server?.memory?.heapUsed || 'Unknown'}`);
        console.log(`📊 Requests: ${connectionTest.health.metrics?.totalRequests || 0}`);
        console.log(`⚡ Ultra-Fast: ${connectionTest.health.metrics?.ultraFastResponses || 0}`);
        return true;
    } else {
        console.log('❌ Server connection failed');
        console.log(`🔍 Error: ${connectionTest.error}`);
        return false;
    }
};

// Function to check for common connection issues
const checkCommonIssues = () => {
    console.log('\n2. Checking common connection issues...');
    
    const issues = [];
    
    // Check if port is in use
    const { spawn } = require('child_process');
    const netstat = spawn('netstat', ['-ano', '|', 'findstr', ':5000']);
    
    return new Promise((resolve) => {
        let output = '';
        netstat.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        netstat.on('close', (code) => {
            if (output.includes('LISTENING')) {
                console.log('✅ Port 5000 is listening');
            } else {
                console.log('❌ Port 5000 is not listening');
                issues.push('Port 5000 is not bound');
            }
            
            if (output.includes('ESTABLISHED')) {
                console.log('✅ Active connections found');
            } else {
                console.log('⚠️ No active connections');
            }
            
            resolve(issues);
        });
    });
};

// Function to fix connection issues
const fixConnectionIssues = async () => {
    console.log('\n3. Attempting to fix connection issues...');
    
    // Kill existing node processes on port 5000
    console.log('🔧 Cleaning up existing processes...');
    
    const { spawn } = require('child_process');
    
    // Find and kill processes using port 5000
    const findProcess = spawn('netstat', ['-ano', '|', 'findstr', ':5000']);
    let output = '';
    
    findProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    
    findProcess.on('close', async (code) => {
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
                await new Promise(resolve => kill.on('close', resolve));
            }
            console.log('✅ Processes terminated');
        } else {
            console.log('✅ No processes to terminate');
        }
        
        // Wait a moment and start fresh server
        setTimeout(async () => {
            console.log('\n4. Starting fresh server...');
            await startFreshServer();
        }, 2000);
    });
};

// Function to start fresh server
const startFreshServer = async () => {
    console.log('🚀 Starting fresh VUAI Agent server...');
    
    const { spawn } = require('child_process');
    const path = require('path');
    
    const serverProcess = spawn('node', ['serverAdvanced.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
        env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: 5000
        }
    });
    
    let serverOutput = '';
    let serverError = '';
    
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        serverOutput += output;
        console.log(output);
    });
    
    serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        serverError += output;
        console.error(output);
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start server:', error.message);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`📊 Server process exited with code ${code}`);
    });
    
    // Wait for server to start and test connection
    setTimeout(async () => {
        console.log('\n5. Testing new server connection...');
        const connectionTest = await testServerConnection();
        
        if (connectionTest.success) {
            console.log('🎉 Connection issue fixed!');
            console.log('✅ Server is responding correctly');
            console.log(`🌐 Server: http://localhost:5000`);
            console.log(`📊 Health: http://localhost:5000/health`);
            console.log(`⚡ Ultra-Fast: http://localhost:5000/api/ultra-fast`);
        } else {
            console.log('❌ Connection issue persists');
            console.log('🔍 Error:', connectionTest.error);
            console.log('\n🔧 Manual fix required:');
            console.log('1. Check MongoDB service is running');
            console.log('2. Verify database connection string');
            console.log('3. Check firewall settings');
            console.log('4. Restart your computer');
        }
    }, 5000);
};

// Main diagnosis function
const runDiagnosis = async () => {
    console.log('🔍 Starting VUAI Agent Connection Diagnosis...\n');
    
    // Test current connection
    const isConnected = await diagnoseConnection();
    
    if (isConnected) {
        console.log('\n🎉 Connection is working properly!');
        console.log('No fixes needed.');
        return;
    }
    
    // Check for common issues
    const issues = await checkCommonIssues();
    
    if (issues.length > 0) {
        console.log(`\n⚠️ Found ${issues.length} issues:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Attempt to fix issues
    await fixConnectionIssues();
};

// Run the diagnosis
runDiagnosis().catch(console.error);
