const http = require('http');

// Test knowledge endpoint with proper JSON formatting
const testData = {
    query: "python programming",
    category: "cse"
};

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/knowledge',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(testData))
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        console.log('Response Body:', body);
        try {
            const jsonData = JSON.parse(body);
            console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
        } catch (error) {
            console.log('JSON Parse Error:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.write(JSON.stringify(testData));
req.end();
