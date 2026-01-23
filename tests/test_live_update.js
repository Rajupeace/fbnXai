const http = require('http');

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testDashboard() {
  console.log('\n════════════════════════════════════════════');
  console.log('🔄 DASHBOARD UPDATE TEST');
  console.log('════════════════════════════════════════════\n');

  try {
    // Login
    console.log('📍 Step 1: Admin Login');
    const login = await makeRequest('POST', '/api/admin/login', {
      adminId: 'BobbyFNB@09=',
      password: 'Martin@FNB09'
    });
    
    if (login.status !== 200) {
      console.error('❌ Login failed:', login.body);
      return;
    }
    
    const token = login.body.token;
    console.log('✅ Login successful\n');

    // Get students
    console.log('📍 Step 2: Get Students');
    const students = await makeRequest('GET', '/api/students');
    
    if (!Array.isArray(students.body) || students.body.length === 0) {
      console.error('❌ No students found');
      return;
    }
    
    const student = students.body[0];
    const originalName = student.studentName;
    console.log(`✅ Found ${students.body.length} students`);
    console.log(`   First student: ${originalName} (${student.sid})\n`);

    // Update student
    console.log('📍 Step 3: Update Student');
    const newName = `Updated-${Date.now()}`;
    const updateReq = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/students/${student.sid}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', async () => {
        try {
          const result = JSON.parse(body);
          
          if (result.success) {
            console.log('✅ Update successful');
            console.log(`   New name: ${newName}\n`);

            // Verify
            console.log('📍 Step 4: Verify Update');
            await new Promise(r => setTimeout(r, 500));
            
            const verify = await makeRequest('GET', '/api/students');
            const updated = verify.body.find(s => s.sid === student.sid);
            
            if (updated && updated.studentName === newName) {
              console.log('✅ DATA PERSISTED IN DATABASE!');
              console.log(`   Confirmed: ${updated.studentName}\n`);
              console.log('════════════════════════════════════════════');
              console.log('🎉 DASHBOARD UPDATE WORKING CORRECTLY');
              console.log('════════════════════════════════════════════\n');
            } else {
              console.log('❌ Data not found after update');
            }
          } else {
            console.error('❌ Update failed:', result);
          }
        } catch (e) {
          console.error('❌ Error:', e.message);
        }
      });
    });

    updateReq.on('error', err => console.error('❌ Error:', err));
    updateReq.write(JSON.stringify({ studentName: newName }));
    updateReq.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDashboard();
