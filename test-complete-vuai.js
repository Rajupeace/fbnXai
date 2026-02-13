// Complete VuAI Agent Verification Test
const http = require('http');

const testCases = [
    { message: 'hello', role: 'student', name: 'Student Greeting' },
    { message: 'I have doubt in dsa', role: 'student', name: 'DSA Doubt' },
    { message: 'database normalization', role: 'student', name: 'Database Query' },
    { message: 'help with coding', role: 'student', name: 'Coding Help' },
    { message: 'exam preparation', role: 'student', name: 'Exam Prep' },
    { message: 'hello professor', role: 'faculty', name: 'Faculty Greeting' },
    { message: 'mark attendance', role: 'faculty', name: 'Faculty Request' },
    { message: 'hello admin', role: 'admin', name: 'Admin Greeting' }
];

let passCount = 0;
let failCount = 0;

function makeRequest(test) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ 
            message: test.message, 
            role: test.role,
            userId: `user_${Date.now()}`
        });
        
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
                    if (json.response && json.response.length > 0) {
                        console.log(`✅ ${test.name}`);
                        console.log(`   Time: ${json.responseTime}ms | Cache: ${json.from_cache ? 'YES' : 'NO'}`);
                        passCount++;
                    } else {
                        console.log(`❌ ${test.name} - Empty response`);
                        failCount++;
                    }
                } catch (e) {
                    console.log(`❌ ${test.name} - Parse error: ${e.message}`);
                    failCount++;
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`❌ ${test.name} - Connection error`);
            failCount++;
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('\n' + '═'.repeat(60));
    console.log('  📊 VuAI AGENT COMPLETE VERIFICATION TEST');
    console.log('═'.repeat(60) + '\n');
    
    for (const test of testCases) {
        await makeRequest(test);
        await new Promise(r => setTimeout(r, 400));
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`  ✅ PASSED: ${passCount}/${testCases.length} tests`);
    console.log(`  ❌ FAILED: ${failCount}/${testCases.length} tests`);
    console.log('═'.repeat(60) + '\n');
    
    if (failCount === 0) {
        console.log('  🎉 ALL TESTS PASSED! VuAI AGENT IS FULLY OPERATIONAL!\n');
    }
    
    process.exit(failCount > 0 ? 1 : 0);
}

runTests();
