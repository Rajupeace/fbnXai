const axios = require('axios');

async function testAdminSubjectOperations() {
  try {
    // Login first
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      adminId: 'admin',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('🔐 Admin logged in successfully');

    // Test 1: Create another subject
    console.log('\n📚 Creating another subject...');
    const subject1 = await axios.post('http://localhost:5000/api/subjects', {
      name: 'Data Structures & Algorithms',
      code: 'CSE201',
      year: '2',
      semester: '3',
      branch: 'CSE',
      description: 'Fundamental data structures and algorithms',
      credits: 3
    }, { headers });
    console.log('✅ Subject 1 created:', subject1.data.courseName);

    // Test 2: Create subject with different branch
    console.log('\n📚 Creating ECE subject...');
    const subject2 = await axios.post('http://localhost:5000/api/subjects', {
      name: 'Digital Electronics',
      code: 'ECE101',
      year: '1',
      semester: '1',
      branch: 'ECE',
      description: 'Basic digital electronics concepts',
      credits: 4
    }, { headers });
    console.log('✅ Subject 2 created:', subject2.data.courseName);

    // Test 3: List all subjects
    console.log('\n📋 Listing all subjects...');
    const subjects = await axios.get('http://localhost:5000/api/subjects');
    console.log(`✅ Found ${subjects.data.length} subjects:`);
    subjects.data.forEach(s => {
      console.log(`  - ${s.code}: ${s.name} (${s.year}-${s.semester}, ${s.branch})`);
    });

    // Test 4: Update a subject
    console.log('\n✏️ Updating subject...');
    const updateRes = await axios.put(`http://localhost:5000/api/subjects/${subject1.data.id}`, {
      name: 'Data Structures & Advanced Algorithms',
      description: 'Advanced data structures and algorithm analysis',
      credits: 4
    }, { headers });
    console.log('✅ Subject updated:', updateRes.data.courseName);

    // Test 5: Get courses (should show subjects)
    console.log('\n📚 Getting courses list...');
    const courses = await axios.get('http://localhost:5000/api/courses');
    console.log(`✅ Found ${courses.data.length} courses:`);
    courses.data.forEach(c => {
      console.log(`  - ${c.code}: ${c.name} (${c.year})`);
    });

    console.log('\n🎉 All admin subject operations working perfectly!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminSubjectOperations();
