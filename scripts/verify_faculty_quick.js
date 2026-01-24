const axios = require('axios');
const API_URL = 'http://localhost:5000';

const FACULTY_CREDENTIALS = {
  facultyId: 'FAC1769200085239',
  password: 'FacPass123'
};

async function test() {
  try {
    console.log('🧪 Testing Faculty Dashboard...\n');

    // 1. Faculty Login
    console.log('1️⃣  FACULTY LOGIN');
    const loginRes = await axios.post(`${API_URL}/api/faculty/login`, FACULTY_CREDENTIALS);
    const token = loginRes.data.token;
    console.log(`   ✅ Login Success - Token: ${token.substring(0, 30)}...`);

    const headers = { 'x-faculty-token': token };

    // 2. View Students
    console.log('\n2️⃣  VIEW STUDENTS');
    const studentsRes = await axios.get(`${API_URL}/api/students`, { headers });
    console.log(`   ✅ Retrieved ${studentsRes.data.length} students`);

    // 3. View Courses  
    console.log('\n3️⃣  VIEW COURSES');
    const coursesRes = await axios.get(`${API_URL}/api/courses`, { headers });
    console.log(`   ✅ Retrieved ${coursesRes.data.length} courses`);

    // 4. View Materials
    console.log('\n4️⃣  VIEW MATERIALS');
    const materialsRes = await axios.get(`${API_URL}/api/materials`, { headers });
    console.log(`   ✅ Retrieved ${materialsRes.data.length} materials`);

    // 5. View Messages
    console.log('\n5️⃣  VIEW MESSAGES');
    const messagesRes = await axios.get(`${API_URL}/api/messages`, { headers });
    console.log(`   ✅ Retrieved ${messagesRes.data.length} messages`);

    // 6. Send Message
    console.log('\n6️⃣  SEND MESSAGE');
    const msgRes = await axios.post(`${API_URL}/api/messages`, {
      subject: `Faculty Test ${Date.now()}`,
      message: 'Testing faculty messaging',
      recipientId: studentsRes.data[0]._id || 'test'
    }, { headers });
    console.log(`   ✅ Message sent`);

    // 7. Mark Attendance
    console.log('\n7️⃣  MARK ATTENDANCE');
    const attRes = await axios.post(`${API_URL}/api/attendance`, {
      year: '1',
      section: 'A',
      subject: 'MSD',
      date: new Date().toISOString().split('T')[0],
      presentStudents: [studentsRes.data[0]._id || 'test'],
      absentStudents: []
    }, { headers });
    console.log(`   ✅ Attendance marked`);

    console.log('\n✨ ALL TESTS PASSED\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

test();
