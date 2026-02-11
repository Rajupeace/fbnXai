const http = require('http');

// Quick VUAI Agent status check
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            console.log('✅ VUAI Agent Status:', data.status);
            console.log('📊 Features:', Object.keys(data.features).length, 'active');
            console.log('🗄️ Database:', data.database.status);
            console.log('⚡ Response Time:', data.responseTime + 'ms');
        } catch (e) {
            console.log('❌ Parse error');
        }
    });
});

req.on('error', (err) => console.log('❌ Error:', err.message));
req.end();
