const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testStudentUpdate() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 STUDENT UPDATE ENDPOINT TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Admin Login
    console.log('📍 Step 1: Admin Login');
    const loginResponse = await axios.post(`${API_URL}/api/admin/login`, {
      adminId: 'BobbyFNB@09=',
      password: 'Martin@FNB09'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    console.log(`   Token: ${token.substring(0, 30)}...`);
    console.log(`   Full response:`, JSON.stringify(loginResponse.data, null, 2));

    // Step 2: Get students list
    console.log('\n📍 Step 2: Fetch Students List');
    const studentsResponse = await axios.get(`${API_URL}/api/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const students = studentsResponse.data;
    console.log(`✅ Fetched ${students.length} students`);

    if (students.length === 0) {
      console.log('⚠️  No students found. Cannot test update.');
      return;
    }

    const studentId = students[0].sid;
    console.log(`   Using student: ${studentId}`);

    // Step 3: Update student
    console.log('\n📍 Step 3: Update Student Details');
    const updateData = {
      studentName: 'Test Updated Name ' + Date.now(),
      email: `updated${Date.now()}@example.edu`
    };

    console.log(`   Payload:`, JSON.stringify(updateData, null, 2));

    try {
      const updateResponse = await axios.put(
        `${API_URL}/api/students/${studentId}`,
        updateData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log('✅ Update successful');
      console.log(`   Response:`, JSON.stringify(updateResponse.data, null, 2));
    } catch (updateError) {
      console.log('❌ Update failed');
      console.log(`   Status: ${updateError.response?.status}`);
      console.log(`   Error:`, JSON.stringify(updateError.response?.data, null, 2));

      // Debug: Try with different header format
      console.log('\n📍 Retry Step 3: Try with x-admin-token header');
      try {
        const retryResponse = await axios.put(
          `${API_URL}/api/students/${studentId}`,
          updateData,
          {
            headers: { 'x-admin-token': token }
          }
        );

        console.log('✅ Update successful (with x-admin-token)');
        console.log(`   Response:`, JSON.stringify(retryResponse.data, null, 2));
      } catch (retryError) {
        console.log('❌ Retry also failed');
        console.log(`   Status: ${retryError.response?.status}`);
        console.log(`   Error:`, JSON.stringify(retryError.response?.data, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testStudentUpdate();
