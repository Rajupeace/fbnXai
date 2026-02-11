const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';

async function debugMaterialUpload() {
  try {
    console.log('🔐 Step 1: Faculty Login');
    
    // Try to find an existing faculty or create test data
    // First, let's use credentials from the test
    const loginRes = await axios.post(`${API_URL}/api/faculty/login`, {
      facultyId: 'FAC1769200085239',
      password: 'FacPass123'
    });

    const facultyToken = loginRes.data.token;
    console.log('✅ Login successful');
    console.log(`   Faculty ID: ${loginRes.data.facultyData.facultyId}`);
    console.log(`   Token: ${facultyToken.substring(0, 30)}...`);

    console.log('\n📤 Step 2: Debug Material Upload Request');
    
    // Create test file
    const testFilePath = path.join(__dirname, 'test_faculty_upload.txt');
    fs.writeFileSync(testFilePath, 'This is faculty test material.');

    // Create form data
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath));
    form.append('title', 'Faculty Test Material');
    form.append('subject', 'Mathematics');
    form.append('type', 'notes');
    form.append('year', '1');
    form.append('semester', '1');
    form.append('section', 'A');

    console.log('   Request Details:');
    console.log(`   URL: ${API_URL}/api/materials`);
    console.log(`   Method: POST`);
    console.log(`   Auth Header: x-faculty-token: ${facultyToken.substring(0, 20)}...`);
    console.log(`   Content-Type: multipart/form-data`);
    console.log(`   Body Fields: title, subject, type, year, semester, section, file`);

    try {
      const uploadRes = await axios.post(
        `${API_URL}/api/materials`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'x-faculty-token': facultyToken
          },
          timeout: 10000
        }
      );

      console.log('\n✅ Material uploaded successfully!');
      console.log(`   Response: ${JSON.stringify(uploadRes.data, null, 2)}`);

    } catch (uploadErr) {
      console.log('\n❌ Material upload failed!');
      console.log(`   Status: ${uploadErr.response?.status}`);
      console.log(`   Error: ${uploadErr.response?.data?.message || uploadErr.message}`);
      console.log(`   Full Response: ${JSON.stringify(uploadErr.response?.data, null, 2)}`);

      // Additional debug info
      console.log('\n🔍 Debug Information:');
      console.log(`   Response Headers: ${JSON.stringify(uploadErr.response?.headers, null, 2)}`);
      
      if (uploadErr.response?.status === 401) {
        console.log('\n⚠️  AUTHENTICATION ERROR - Checking faculty token lookup...');
        
        // Try to get faculty to verify they exist
        try {
          const checkRes = await axios.get(
            `${API_URL}/api/faculty`,
            {
              headers: {
                'x-faculty-token': facultyToken
              }
            }
          );
          console.log('✅ Faculty token is valid for fetching faculty list');
          console.log(`   Retrieved ${Array.isArray(checkRes.data) ? checkRes.data.length : 0} faculty members`);
        } catch (checkErr) {
          console.log('❌ Faculty token not recognized for faculty list either');
        }
      }
    }

    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('Fatal error:', error.message);
  }
}

debugMaterialUpload();
