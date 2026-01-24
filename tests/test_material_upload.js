const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';
const ADMIN_ID = 'BobbyFNB@09=';
const ADMIN_PASSWORD = 'Martin@FNB09';

let adminToken = '';

async function testMaterialUpload() {
  try {
    console.log('🔐 Step 1: Admin Login');
    
    const loginRes = await axios.post(`${API_URL}/api/admin/login`, {
      adminId: ADMIN_ID,
      password: ADMIN_PASSWORD
    });

    adminToken = loginRes.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${adminToken.substring(0, 30)}...`);

    console.log('\n📤 Step 2: Upload Material');
    
    // Create test file
    const testFilePath = path.join(__dirname, 'test_upload.txt');
    fs.writeFileSync(testFilePath, 'This is a test material file for upload testing.');

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', 'Test Upload Material');
    form.append('subject', 'Computer Science');
    form.append('type', 'notes'); // Required field: 'notes', 'videos', 'assignment', 'syllabus', 'modelPapers', 'interviewQnA'
    form.append('year', '1');
    form.append('semester', '1');
    form.append('section', 'A');
    form.append('branch', 'CSE');

    console.log('   Sending POST request to /api/materials');
    console.log(`   Auth Header: x-admin-token: ${adminToken.substring(0, 20)}...`);
    console.log('   Form Fields: file, title, subject, year, semester, section, branch');

    const uploadRes = await axios.post(
      `${API_URL}/api/materials`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'x-admin-token': adminToken
        },
        timeout: 10000
      }
    );

    console.log('\n✅ Material uploaded successfully!');
    console.log('   Response:', JSON.stringify(uploadRes.data, null, 2));

    // Cleanup
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   Headers:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

testMaterialUpload();
