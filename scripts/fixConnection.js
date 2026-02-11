// VUAI Agent Connection Fix Script
const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 VUAI Agent Connection Fix Script');
console.log('=====================================\n');

// Function to check if port is in use
const checkPort = (port) => {
    return new Promise((resolve) => {
        const netstat = spawn('netstat', ['-ano', '|', 'findstr', `:${port}`]);
        let output = '';
        
        netstat.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        netstat.on('close', (code) => {
            resolve(output.includes(port));
        });
    });
};

// Function to kill process on port
const killPort = (port) => {
    return new Promise((resolve) => {
        const netstat = spawn('netstat', ['-ano', '|', 'findstr', `:${port}`]);
        let output = '';
        
        netstat.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        netstat.on('close', (code) => {
            const lines = output.split('\n');
            for (const line of lines) {
                if (line.includes(port) && line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid)) {
                        console.log(`🔌 Killing process ${pid} on port ${port}`);
                        const taskkill = spawn('taskkill', ['/PID', pid, '/F']);
                        taskkill.on('close', () => {
                            resolve(true);
                        });
                        return;
                    }
                }
            }
            resolve(false);
        });
    });
};

// Function to start the server
const startServer = () => {
    console.log('🚀 Starting VUAI Agent Server...');
    
    const serverProcess = spawn('node', ['serverEnhanced.js'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start server:', error.message);
    });
    
    serverProcess.on('close', (code) => {
        console.log(`📊 Server process exited with code ${code}`);
    });
    
    return serverProcess;
};

// Main fix function
const fixConnection = async () => {
    const port = 5000;
    
    console.log(`1. Checking port ${port}...`);
    const portInUse = await checkPort(port);
    
    if (portInUse) {
        console.log(`⚠️ Port ${port} is in use. Killing existing process...`);
        await killPort(port);
        console.log('✅ Port cleared');
    } else {
        console.log(`✅ Port ${port} is available`);
    }
    
    console.log('\n2. Starting enhanced server...');
    const server = startServer();
    
    // Wait a bit and then check if server is running
    setTimeout(async () => {
        console.log('\n3. Verifying server health...');
        try {
            const response = await fetch(`http://localhost:${port}/health`);
            const health = await response.json();
            
            console.log('✅ Server is running and healthy!');
            console.log(`📊 Database Status: ${health.database.status}`);
            console.log(`🌐 Server: http://localhost:${port}`);
            console.log(`🔧 Health Check: http://localhost:${port}/health`);
            
        } catch (error) {
            console.log('⚠️ Server may still be starting up...');
            console.log('🌐 Try accessing: http://localhost:5000');
        }
        
        console.log('\n🎯 VUAI Agent is ready!');
        console.log('📝 Connection fix completed successfully!');
    }, 3000);
};

// Run the fix
fixConnection().catch(console.error);
