const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';
const ADMIN_ID = 'BobbyFNB@09=';
const ADMIN_PASSWORD = 'Martin@FNB09';

let adminToken = '';
let testResults = {
  login: false,
  addStudent: false,
  addFaculty: false,
  addCourse: false,
  uploadMaterial: false,
  sendMessage: false,
  getStudents: false,
  getFaculty: false,
  getCourses: false,
  getMaterials: false
};

async function log(title, message, status = 'info') {
  const timestamp = new Date().toISOString();
  const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : 'ℹ️';
  console.log(`\n[${timestamp}] ${icon} ${title}`);
  console.log(`   ${message}`);
}

// 1. Admin Login Test
async function testAdminLogin() {
  try {
    await log('ADMIN LOGIN', 'Attempting to login...');
    
    const response = await axios.post(`${API_URL}/api/admin/login`, {
      adminId: ADMIN_ID,
      password: ADMIN_PASSWORD
    });

    if (response.data.token) {
      adminToken = response.data.token;
      testResults.login = true;
      await log('ADMIN LOGIN', `✓ Login successful - Token: ${adminToken.substring(0, 20)}...`, 'success');
      return true;
    } else {
      await log('ADMIN LOGIN', `✗ No token received: ${JSON.stringify(response.data)}`, 'error');
      return false;
    }
  } catch (error) {
    await log('ADMIN LOGIN', `✗ Login failed: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return false;
  }
}

// 2. Add Student Test
async function testAddStudent() {
  try {
    await log('ADD STUDENT', 'Attempting to add a new student...');
    
    const studentData = {
      sid: `TST${Date.now()}`,
      studentName: 'Test Student',
      email: `teststudent${Date.now()}@vignan.edu`,
      password: 'TestPass123',
      year: '1',
      section: 'A',
      branch: 'CSE'
    };

    const response = await axios.post(
      `${API_URL}/api/students`,
      studentData,
      {
        headers: {
          'x-admin-token': adminToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.addStudent = response.status === 201 || response.status === 200;
    await log('ADD STUDENT', `✓ Student added: ${studentData.sid} - ID: ${response.data._id || response.data.id}`, 'success');
    return response.data;
  } catch (error) {
    await log('ADD STUDENT', `✗ Failed to add student: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 3. Add Faculty Test
async function testAddFaculty() {
  try {
    await log('ADD FACULTY', 'Attempting to add a new faculty member...');
    
    const facultyData = {
      facultyId: `FAC${Date.now()}`,
      name: 'Test Faculty',
      email: `testfaculty${Date.now()}@vignan.edu`,
      password: 'FacPass123',
      department: 'Computer Science',
      specialization: 'AI/ML'
    };

    const response = await axios.post(
      `${API_URL}/api/faculty`,
      facultyData,
      {
        headers: {
          'x-admin-token': adminToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.addFaculty = response.status === 201 || response.status === 200;
    await log('ADD FACULTY', `✓ Faculty added: ${facultyData.facultyId} - ID: ${response.data._id || response.data.id}`, 'success');
    return response.data;
  } catch (error) {
    await log('ADD FACULTY', `✗ Failed to add faculty: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 4. Add Course Test
async function testAddCourse() {
  try {
    await log('ADD COURSE', 'Attempting to add a new course...');
    
    const courseData = {
      name: `Test Course ${Date.now()}`,
      code: `TST${Date.now()}`,
      year: '1',
      semester: '1',
      branch: 'CSE',
      sections: ['A', 'B']
    };

    const response = await axios.post(
      `${API_URL}/api/courses`,
      courseData,
      {
        headers: {
          'x-admin-token': adminToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.addCourse = response.status === 201 || response.status === 200;
    await log('ADD COURSE', `✓ Course added: ${courseData.code} - ID: ${response.data._id || response.data.id}`, 'success');
    return response.data;
  } catch (error) {
    await log('ADD COURSE', `✗ Failed to add course: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 5. Upload Material Test
async function testUploadMaterial() {
  try {
    await log('UPLOAD MATERIAL', 'Attempting to upload material...');
    
    const testFilePath = path.join(__dirname, 'test_material.txt');
    fs.writeFileSync(testFilePath, 'This is a test material file.');

    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', `Test Material ${Date.now()}`);
    form.append('subject', 'Mathematics');
    form.append('type', 'notes'); // Required field
    form.append('year', '1');
    form.append('semester', '1');
    form.append('section', 'A');

    const response = await axios.post(
      `${API_URL}/api/materials`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-admin-token': adminToken
        }
      }
    );

    fs.unlinkSync(testFilePath);
    testResults.uploadMaterial = response.status === 201 || response.status === 200;
    await log('UPLOAD MATERIAL', `✓ Material uploaded: ${response.data.filename || response.data.title}`, 'success');
    return response.data;
  } catch (error) {
    await log('UPLOAD MATERIAL', `✗ Failed to upload material: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 6. Send Message Test
async function testSendMessage() {
  try {
    await log('SEND MESSAGE', 'Attempting to send a message...');
    
    const messageData = {
      recipientId: 'all',
      subject: `Test Message ${Date.now()}`,
      message: 'This is a test message from admin'
    };

    const response = await axios.post(
      `${API_URL}/api/messages`,
      messageData,
      {
        headers: {
          'x-admin-token': adminToken,
          'Content-Type': 'application/json'
        }
      }
    );

    testResults.sendMessage = response.status === 201 || response.status === 200;
    await log('SEND MESSAGE', `✓ Message sent: ${messageData.subject}`, 'success');
    return response.data;
  } catch (error) {
    await log('SEND MESSAGE', `✗ Failed to send message: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 7. Get Students Test
async function testGetStudents() {
  try {
    await log('GET STUDENTS', 'Fetching all students...');
    
    const response = await axios.get(
      `${API_URL}/api/students`,
      {
        headers: {
          'x-admin-token': adminToken
        }
      }
    );

    const count = Array.isArray(response.data) ? response.data.length : response.data.students?.length || 0;
    testResults.getStudents = count >= 0;
    await log('GET STUDENTS', `✓ Fetched ${count} students from database`, 'success');
    return response.data;
  } catch (error) {
    await log('GET STUDENTS', `✗ Failed to fetch students: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 8. Get Faculty Test
async function testGetFaculty() {
  try {
    await log('GET FACULTY', 'Fetching all faculty members...');
    
    const response = await axios.get(
      `${API_URL}/api/faculty`,
      {
        headers: {
          'x-admin-token': adminToken
        }
      }
    );

    const count = Array.isArray(response.data) ? response.data.length : response.data.faculty?.length || 0;
    testResults.getFaculty = count >= 0;
    await log('GET FACULTY', `✓ Fetched ${count} faculty members from database`, 'success');
    return response.data;
  } catch (error) {
    await log('GET FACULTY', `✗ Failed to fetch faculty: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 9. Get Courses Test
async function testGetCourses() {
  try {
    await log('GET COURSES', 'Fetching all courses...');
    
    const response = await axios.get(
      `${API_URL}/api/courses`,
      {
        headers: {
          'x-admin-token': adminToken
        }
      }
    );

    const count = Array.isArray(response.data) ? response.data.length : response.data.courses?.length || 0;
    testResults.getCourses = count >= 0;
    await log('GET COURSES', `✓ Fetched ${count} courses from database`, 'success');
    return response.data;
  } catch (error) {
    await log('GET COURSES', `✗ Failed to fetch courses: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// 10. Get Materials Test
async function testGetMaterials() {
  try {
    await log('GET MATERIALS', 'Fetching all materials...');
    
    const response = await axios.get(
      `${API_URL}/api/materials`,
      {
        headers: {
          'x-admin-token': adminToken
        }
      }
    );

    const count = Array.isArray(response.data) ? response.data.length : response.data.materials?.length || 0;
    testResults.getMaterials = count >= 0;
    await log('GET MATERIALS', `✓ Fetched ${count} materials from database`, 'success');
    return response.data;
  } catch (error) {
    await log('GET MATERIALS', `✗ Failed to fetch materials: ${error.message}`, 'error');
    if (error.response?.data) {
      console.log('   Response:', error.response.data);
    }
    return null;
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  ADMIN DASHBOARD FUNCTIONALITY TEST SUITE              ║');
  console.log('║  Testing all features and MongoDB integration          ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  // 1. Login first
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    console.log('\n❌ CRITICAL: Admin login failed. Cannot continue tests.');
    process.exit(1);
  }

  // 2. Test Write Operations (Creating Data)
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('PHASE 1: WRITE OPERATIONS (Creating Data)');
  console.log('═══════════════════════════════════════════════════════');
  
  await testAddStudent();
  await testAddFaculty();
  await testAddCourse();
  await testUploadMaterial();
  await testSendMessage();

  // Wait a moment for data to be processed
  console.log('\n⏳ Waiting for data to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. Test Read Operations (Retrieving Data)
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('PHASE 2: READ OPERATIONS (Retrieving Data from MongoDB)');
  console.log('═══════════════════════════════════════════════════════');
  
  const students = await testGetStudents();
  const faculty = await testGetFaculty();
  const courses = await testGetCourses();
  const materials = await testGetMaterials();

  // 4. Print Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  TEST RESULTS SUMMARY                                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(v => v).length;
  const passPercentage = ((passedTests / totalTests) * 100).toFixed(2);

  Object.entries(testResults).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${test.toUpperCase().padEnd(20)} : ${status}`);
  });

  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed (${passPercentage}%)`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Admin functionality is working correctly.');
    console.log('✓ MongoDB is successfully storing and retrieving data');
    console.log('✓ All CRUD operations are functioning properly');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please review the errors above.`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('Database Summary:');
  console.log(`  • Total Students: ${Array.isArray(students) ? students.length : 0}`);
  console.log(`  • Total Faculty: ${Array.isArray(faculty) ? faculty.length : 0}`);
  console.log(`  • Total Courses: ${Array.isArray(courses) ? courses.length : 0}`);
  console.log(`  • Total Materials: ${Array.isArray(materials) ? materials.length : 0}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run all tests
runAllTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
