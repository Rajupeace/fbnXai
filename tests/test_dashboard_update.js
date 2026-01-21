const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testDashboardUpdate() {
  console.log('\n🔄 TESTING DASHBOARD DATA UPDATE\n');
  
  try {
    // Step 1: Login
    console.log('📍 Step 1: Admin Login');
    const loginRes = await axios.post(`${API_URL}/api/admin/login`, {
      adminId: 'BobbyFNB@09=',
      password: 'Martin@FNB09'
    });
    const token = loginRes.data.token;
    console.log('✅ Logged in successfully\n');

    // Step 2: Get current students
    console.log('📍 Step 2: Fetch Current Students');
    const studentsRes = await axios.get(`${API_URL}/api/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const students = studentsRes.data;
    console.log(`✅ Found ${students.length} students`);

    if (students.length === 0) {
      console.log('❌ No students found!');
      return;
    }

    const student = students[0];
    console.log(`   Student: ${student.studentName} (${student.sid})\n`);

    // Step 3: Update student
    console.log('📍 Step 3: Update Student Name');
    const newName = `Updated ${Date.now()}`;
    const updateRes = await axios.put(
      `${API_URL}/api/students/${student.sid}`,
      { studentName: newName },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (updateRes.data.success) {
      console.log('✅ Update successful!');
      console.log(`   New name: ${newName}\n`);
    } else {
      console.log('❌ Update failed!');
      console.log(updateRes.data);
      return;
    }

    // Step 4: Verify update (fetch again)
    console.log('📍 Step 4: Verify Update (Fetch Updated Data)');
    await new Promise(r => setTimeout(r, 500));
    
    const verifyRes = await axios.get(`${API_URL}/api/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const updatedStudent = verifyRes.data.find(s => s.sid === student.sid);
    
    if (updatedStudent && updatedStudent.studentName === newName) {
      console.log('✅ Verification successful!');
      console.log(`   Database has updated: ${updatedStudent.studentName}\n`);
    } else {
      console.log('❌ Data not updated in database!');
      console.log(`   Expected: ${newName}`);
      console.log(`   Got: ${updatedStudent?.studentName}\n`);
    }

    console.log('🎉 DASHBOARD UPDATE TEST COMPLETE\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.status === 500) {
      console.error('Response data:', error.response.data);
    }
  }
}

testDashboardUpdate();
