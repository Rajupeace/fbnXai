const http = require('http');

// Test data - use real admin token from your system
const studentId = 'S001';
const adminToken = 'your-admin-token-here'; // Replace with real token

const updateData = JSON.stringify({
  studentName: 'Updated Name Test',
  email: 'updated@example.edu',
  branch: 'CSE',
  year: 2
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/students/${studentId}`,
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': updateData.length,
    'x-admin-token': adminToken
  }
};

console.log('🔄 Testing Student Update Endpoint...');
console.log(`URL: ${options.method} http://localhost:5000${options.path}`);
console.log(`Student ID: ${studentId}`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n✅ Response Status: ${res.statusCode}`);
    console.log(`📦 Response Body:`);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.write(updateData);
req.end();
