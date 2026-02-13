// Quick test script for VuAI endpoints
const http = require('http');

const tests = [
  { role: 'faculty', message: 'hello', name: 'Faculty' },
  { role: 'student', message: 'hi', name: 'Student' },
  { role: 'admin', message: 'status', name: 'Admin' }
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
          console.log(`\n✅ ${test.name} Dashboard:`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Response: ${json.response?.substring(0, 70)}...`);
          console.log(`   Time: ${json.responseTime}ms`);
        } catch (e) {
          console.log(`❌ ${test.name} - Parse error`);
        }
        resolve();
      });
    });

    req.on('error', () => {
      console.log(`❌ ${test.name} - Connection error`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing VuAI Agent Endpoints...\n');
  for (const test of tests) {
    await makeRequest(test);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('\n✅ All tests completed!');
  process.exit(0);
}

runTests();
