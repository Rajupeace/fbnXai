const axios = require('axios');

async function testAI(role, userId, name) {
    try {
        console.log(`Testing AI for Role: ${role}...`);
        const response = await axios.post('http://localhost:5000/api/chat', {
            message: "Who are you and how can you help me?",
            role: role,
            userId: userId,
            user_name: name,
            context: { year: '1', branch: 'CSE' }
        });

        console.log(`Response for ${role}:`);
        console.log(response.data.response);
        console.log('-----------------------------------');
    } catch (err) {
        console.error(`Error for ${role}:`, err.message);
    }
}

async function runTests() {
    await testAI('student', 'student001', 'Satvika');
    await testAI('admin', 'admin001', 'Reddy');
    await testAI('faculty', 'faculty001', 'Professor');
}

runTests();
