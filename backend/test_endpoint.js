// Direct test of the exact endpoint
const axios = require('axios');

async function testEndpoint() {
    console.log('🧪 Testing exact endpoint configuration...\n');

    const payload = {
        user_id: 'test_user',
        message: 'hello',
        role: 'student',
        context: {
            name: 'Test Student',
            year: '3',
            branch: 'CSE'
        }
    };

    const endpoints = [
        'http://localhost:5000/api/chat',
        'http://localhost:5000/api/chat/'
    ];

    for (const url of endpoints) {
        try {
            console.log(`\n📤 Testing: ${url}`);
            const startTime = Date.now();
            const response = await axios.post(url, payload, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const duration = Date.now() - startTime;

            console.log(`✅ SUCCESS in ${duration}ms`);
            console.log(`Response:`, JSON.stringify(response.data, null, 2).substring(0, 200));

        } catch (error) {
            console.error(`❌ FAILED: ${error.message}`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(`Data:`, error.response.data);
            }
        }
    }
}

testEndpoint();
