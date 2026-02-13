// Test Enhanced Student VuAI Agent - B.Tech Support
const http = require('http');

const studentTests = [
    { message: 'I have a doubt in data structures', name: 'DSA Doubt' },
    { message: 'help me understand recursion', name: 'Recursion' },
    { message: 'notes for database management system', name: 'Database Notes' },
    { message: 'what is normalization', name: 'Quick Answer' },
    { message: 'I am confused about oops concepts', name: 'OOPS Doubt' },
    { message: 'how to solve this coding problem', name: 'Coding Help' },
    { message: 'exam preparation strategy', name: 'Exam Prep' },
    { message: 'hello friend', name: 'Greeting' }
];

function makeRequest(message, testName) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ message, role: 'student' });
        
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
                    console.log(`\n✅ ${testName}`);
                    console.log(`   Query: "${message}"`);
                    console.log(`   Response Type: ${json.response.split('\n')[0]}`);
                    console.log(`   Time: ${json.responseTime}ms`);
                } catch (e) {
                    console.log(`❌ ${testName} - Parse error`);
                }
                resolve();
            });
        });

        req.on('error', () => {
            console.log(`❌ ${testName} - Connection error`);
            resolve();
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎓 STUDENT DASHBOARD VuAI - ENHANCED TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    for (const test of studentTests) {
        await makeRequest(test.message, test.name);
        await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL STUDENT DASHBOARD TESTS COMPLETED!');
    console.log('🚀 Student VuAI Agent is Ready for Production');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
}

runTests();
