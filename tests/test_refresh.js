const axios = require('axios');

async function testTokenRefresh() {
  try {
    console.log('Testing admin login...');
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      adminId: 'BobbyFNB@09=',
      password: 'Martin@FNB09'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful, got token');
    
    console.log('Testing token refresh...');
    const refreshRes = await axios.post('http://localhost:5000/api/admin/refresh', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Token refresh successful:', refreshRes.data);
    const newToken = refreshRes.data.token;
    
    console.log('Testing subject creation with new token...');
    const subjectRes = await axios.post('http://localhost:5000/api/subjects', {
      name: 'Test Subject 2',
      code: 'TEST002',
      year: '1',
      branch: 'CSE',
      credits: 4
    }, {
      headers: {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Subject creation with new token successful:', subjectRes.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testTokenRefresh();
