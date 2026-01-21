const axios = require('axios');

async function testAdminSubjectAdd() {
  try {
    console.log('🔐 Testing admin login...');
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      adminId: 'BobbyFNB@09=',
      password: 'Martin@FNB09'
    });
    
    console.log('✅ Login successful:', loginRes.data);
    const token = loginRes.data.token;
    
    console.log('📚 Testing subject creation...');
    const subjectRes = await axios.post('http://localhost:5000/api/subjects', {
      name: 'Advanced Mathematics',
      code: 'MATH301',
      year: '3',
      semester: '5',
      branch: 'CSE',
      description: 'Advanced mathematical concepts for computer science',
      credits: 4
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Subject created successfully:', subjectRes.data);
    
    console.log('📋 Testing subject list...');
    const listRes = await axios.get('http://localhost:5000/api/subjects');
    console.log('✅ Subjects list:', listRes.data.length, 'subjects found');
    
    // Show the newly created subject
    const newSubject = listRes.data.find(s => s.code === 'MATH301');
    if (newSubject) {
      console.log('🎯 New subject details:', newSubject);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminSubjectAdd();
