// Quick test for chat API
const axios = require('axios');

async function testChatAPI() {
    console.log('🧪 Testing VuAiAgent Chat API...\n');

    const payload = {
        user_id: 'test_user',
        message: 'hi',
        role: 'student',
        context: {
            name: 'Test Student',
            year: '3',
            branch: 'CSE'
        }
    };

    try {
        console.log('📤 Sending request to http://localhost:5000/api/chat');
        console.log('📦 Payload:', JSON.stringify(payload, null, 2));

        const startTime = Date.now();
        const response = await axios.post('http://localhost:5000/api/chat', payload, {
            timeout: 10000
        });
        const duration = Date.now() - startTime;

        console.log('\n✅ Response received in', duration, 'ms');
        console.log('📨 Response:', JSON.stringify(response.data, null, 2));

        if (response.data.response) {
            console.log('\n🎉 SUCCESS! AI responded with:', response.data.response.substring(0, 100) + '...');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testChatAPI();
