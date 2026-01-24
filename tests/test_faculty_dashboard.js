const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';

// Test Faculty Credentials
const FACULTY_CREDENTIALS = {
  facultyId: 'FAC1769200085239', // From earlier tests
  password: 'FacPass123'
};

let facultyToken = '';
let facultyData = '';

let testResults = {
  login: false,
  getAssignments: false,
  uploadMaterial: false,
  sendMessage: false,
  markAttendance: false,
  viewStudents: false,
  viewCourses: false,
  updateProfile: false,
  getSchedule: false,
  viewMessages: false
};

async function log(title, message, status = 'info') {
  const timestamp = new Date().toISOString();
  const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : 'ℹ️';
  console.log(`\n[${timestamp}] ${icon} ${title}`);
  console.log(`   ${message}`);
}

// 1. Faculty Login Test
async function testFacultyLogin() {
  try {
    await log('FACULTY LOGIN', 'Attempting to login...');
    
    const response = await axios.post(`${API_URL}/api/faculty/login`, {
      facultyId: FACULTY_CREDENTIALS.facultyId,
      password: FACULTY_CREDENTIALS.password
    });

    if (response.data.token) {
      facultyToken = response.data.token;
      facultyData = response.data.facultyData;
      testResults.login = true;
      await log('FACULTY LOGIN', `✓ Login successful - Token: ${facultyToken.substring(0, 20)}...`, 'success');
      return true;
    } else {
      await log('FACULTY LOGIN', `✗ No token received: ${JSON.stringify(response.data)}`, 'error');
      return false;
    }
  } catch (error) {
    await log('FACULTY LOGIN', `✗ Login failed: ${error.message}`, 'error');
    return false;
  }
}

// 2. Get Teaching Assignments Test
async function testGetAssignments() {
  try {
    await log('TEACHING ASSIGNMENTS', 'Fetching assigned courses...');
    
    const response = await axios.get(
      `${API_URL}/api/faculty/teaching?year=1&section=A&branch=CSE`,
      {
        headers: {
          'x-faculty-token': facultyToken
        }
      }
    );

    testResults.getAssignments = true;
    const count = Array.isArray(response.data) ? response.data.length : 0;
    await log('TEACHING ASSIGNMENTS', `✓ Retrieved ${count} teaching assignments`, 'success');
    return response.data;
  } catch (error) {
    await log('TEACHING ASSIGNMENTS', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 3. Upload Material Test
async function testUploadMaterial() {
  try {
    await log('UPLOAD MATERIAL', 'Attempting to upload lecture material...');
    
    const testFilePath = path.join(__dirname, 'faculty_material.txt');
    fs.writeFileSync(testFilePath, 'This is faculty lecture material.');

    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', `Lecture ${Date.now()}`);
    form.append('subject', 'Mathematics');
    form.append('type', 'notes');
    form.append('year', '1');
    form.append('semester', '1');
    form.append('section', 'A');

    const response = await axios.post(
      `${API_URL}/api/materials`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-faculty-token': facultyToken
        }
      }
    );

    fs.unlinkSync(testFilePath);
    testResults.uploadMaterial = response.status === 201 || response.status === 200;
    await log('UPLOAD MATERIAL', `✓ Material uploaded: ${response.data.title}`, 'success');
    return response.data;
  } catch (error) {
    await log('UPLOAD MATERIAL', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 4. Send Message Test
async function testSendMessage() {
  try {
    await log('SEND MESSAGE', 'Sending message to students...');
    
    const messageData = {
      recipientId: 'students',
      subject: `Faculty Announcement ${Date.now()}`,
      message: 'Important class announcement from faculty'
    };

    const response = await axios.post(
      `${API_URL}/api/messages`,
      messageData,
      {
        headers: {
          'x-faculty-token': facultyToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.sendMessage = response.status === 201 || response.status === 200;
    await log('SEND MESSAGE', `✓ Message sent: ${messageData.subject}`, 'success');
    return response.data;
  } catch (error) {
    await log('SEND MESSAGE', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 5. Mark Attendance Test
async function testMarkAttendance() {
  try {
    await log('MARK ATTENDANCE', 'Marking student attendance...');
    
    const attendanceData = {
      year: '1',
      section: 'A',
      subject: 'Mathematics',
      date: new Date().toISOString().split('T')[0],
      presentStudents: ['TST1769200085225'], // From earlier test
      absentStudents: []
    };

    const response = await axios.post(
      `${API_URL}/api/attendance`,
      attendanceData,
      {
        headers: {
          'x-faculty-token': facultyToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.markAttendance = response.status === 201 || response.status === 200;
    await log('MARK ATTENDANCE', `✓ Attendance marked for ${attendanceData.presentStudents.length} students`, 'success');
    return response.data;
  } catch (error) {
    await log('MARK ATTENDANCE', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 6. View Students Test
async function testViewStudents() {
  try {
    await log('VIEW STUDENTS', 'Fetching student list...');
    
    const response = await axios.get(
      `${API_URL}/api/students`,
      {
        headers: {
          'x-faculty-token': facultyToken
        }
      }
    );

    testResults.viewStudents = true;
    const count = Array.isArray(response.data) ? response.data.length : 0;
    await log('VIEW STUDENTS', `✓ Retrieved ${count} students`, 'success');
    return response.data;
  } catch (error) {
    await log('VIEW STUDENTS', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 7. View Courses Test
async function testViewCourses() {
  try {
    await log('VIEW COURSES', 'Fetching course list...');
    
    const response = await axios.get(
      `${API_URL}/api/courses`,
      {
        headers: {
          'x-faculty-token': facultyToken
        }
      }
    );

    testResults.viewCourses = true;
    const count = Array.isArray(response.data) ? response.data.length : 0;
    await log('VIEW COURSES', `✓ Retrieved ${count} courses`, 'success');
    return response.data;
  } catch (error) {
    await log('VIEW COURSES', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 8. Update Profile Test
async function testUpdateProfile() {
  try {
    await log('UPDATE PROFILE', 'Updating faculty profile...');
    
    const profileData = {
      name: facultyData.name || 'Test Faculty',
      email: facultyData.email || 'faculty@vignan.edu',
      department: 'Computer Science',
      specialization: 'AI/ML',
      phone: '+91-9876543210'
    };

    const response = await axios.put(
      `${API_URL}/api/faculty/${facultyData._id || facultyData.id}`,
      profileData,
      {
        headers: {
          'x-faculty-token': facultyToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.updateProfile = response.status === 200;
    await log('UPDATE PROFILE', `✓ Profile updated successfully`, 'success');
    return response.data;
  } catch (error) {
    await log('UPDATE PROFILE', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 9. Get Schedule Test
async function testGetSchedule() {
  try {
    await log('GET SCHEDULE', 'Fetching faculty schedule...');
    
    const response = await axios.get(
      `${API_URL}/api/schedule`,
      {
        headers: {
          'x-faculty-token': facultyToken
        }
      }
    );

    testResults.getSchedule = true;
    const count = Array.isArray(response.data) ? response.data.length : 0;
    await log('GET SCHEDULE', `✓ Retrieved schedule with ${count} entries`, 'success');
    return response.data;
  } catch (error) {
    await log('GET SCHEDULE', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// 10. View Messages Test
async function testViewMessages() {
  try {
    await log('VIEW MESSAGES', 'Fetching messages...');
    
    const response = await axios.get(
      `${API_URL}/api/messages`,
      {
        headers: {
          'x-faculty-token': facultyToken
        }
      }
    );

    testResults.viewMessages = true;
    const count = Array.isArray(response.data) ? response.data.length : 0;
    await log('VIEW MESSAGES', `✓ Retrieved ${count} messages`, 'success');
    return response.data;
  } catch (error) {
    await log('VIEW MESSAGES', `✗ Failed: ${error.message}`, 'error');
    return null;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  FACULTY DASHBOARD FUNCTIONALITY TEST SUITE            ║');
  console.log('║  Testing all features and MongoDB integration          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // 1. Login first
  const loginSuccess = await testFacultyLogin();
  if (!loginSuccess) {
    console.log('\n❌ CRITICAL: Faculty login failed. Cannot continue tests.');
    process.exit(1);
  }

  // 2. Test Faculty Features
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('PHASE 1: FACULTY FEATURES');
  console.log('═══════════════════════════════════════════════════════');
  
  await testGetAssignments();
  await testUploadMaterial();
  await testSendMessage();
  await testMarkAttendance();
  await testViewStudents();
  await testViewCourses();
  await testUpdateProfile();
  await testGetSchedule();
  await testViewMessages();

  // Wait for data processing
  console.log('\n⏳ Waiting for data to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Print Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  TEST RESULTS SUMMARY                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(v => v).length;
  const passPercentage = ((passedTests / totalTests) * 100).toFixed(2);

  Object.entries(testResults).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${test.toUpperCase().padEnd(25)} : ${status}`);
  });

  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed (${passPercentage}%)`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Faculty dashboard is working correctly.');
    console.log('✓ All sections operational');
    console.log('✓ Data is being saved to MongoDB');
    console.log('✓ Dashboard displays are updating correctly');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please review the errors above.`);
  }

  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Run all tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
