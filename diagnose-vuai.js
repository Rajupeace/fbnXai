// Diagnose VuAI Agent Response Issues
const http = require('http');

const diagnosticTests = [
    { message: 'hello', role: 'student', name: 'Greeting' },
    { message: 'I have doubt', role: 'student', name: 'Doubt' },
    { message: 'data structure', role: 'student', name: 'DSA' },
    { message: 'database', role: 'student', name: 'DB' },
    { message: 'hello', role: 'faculty', name: 'Faculty' },
    { message: 'hello', role: 'admin', name: 'Admin' }
];

function makeRequest(test) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ message: test.message, role: test.role });
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`\n${test.role.toUpperCase()} - ${test.name}:`);
                    console.log(`Query: "${test.message}"`);
                    console.log(`Response Length: ${json.response.length} chars`);
                    console.log(`First 80 chars: ${json.response.substring(0, 80)}...`);
                    console.log(`Time: ${json.responseTime}ms`);
                    console.log(`Full Response: ${json.response.substring(0, 200)}`);
                } catch (e) {
                    console.log(`\n❌ ${test.name} - Parse error: ${e.message}`);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`\n❌ ${test.name} - Connection error: ${e.message}`);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

async function runDiagnostics() {
    console.log('='.repeat(60));
    console.log('VuAI AGENT RESPONSE DIAGNOSTICS');
    console.log('='.repeat(60));
    
    for (const test of diagnosticTests) {
        await makeRequest(test);
        await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSTICS COMPLETE');
    console.log('='.repeat(60));
    process.exit(0);
}

runDiagnostics();
