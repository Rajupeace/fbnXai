const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing admin login...');
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      adminId: 'BobbyFNB@09=',
      password: 'Martin@FNB09'
    });
    
    console.log('Login successful:', loginRes.data);
    const token = loginRes.data.token;
    
    console.log('Testing subject creation with token...');
    const subjectRes = await axios.post('http://localhost:5000/api/subjects', {
      name: 'Test Subject',
      code: 'TEST001',
      year: '1',
      branch: 'CSE',
      credits: 3
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Subject creation successful:', subjectRes.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAuth();
