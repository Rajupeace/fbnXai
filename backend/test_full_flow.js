const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const ADMIN_ID = 'ReddyFBN@1228';
const ADMIN_PASS = 'ReddyFBN';

async function runTest() {
    try {
        console.log('--- 1. Testing Admin Login ---');
        const loginRes = await axios.post(`${API_URL}/admin/login`, {
            adminId: ADMIN_ID,
            password: ADMIN_PASS
        });
        const token = loginRes.data.token;
        console.log('✅ Login Successful. Token obtained.');

        const headers = {
            'x-admin-token': token
        };

        console.log('\n--- 2. Testing Add Subject (Course) ---');
        const courseCode = `TEST${Date.now()}`; // Unique code
        const courseRes = await axios.post(`${API_URL}/subjects`, {
            name: "Workflow Test Subject",
            code: courseCode,
            year: "1",
            semester: "1",
            branch: "CSE",
            description: "Subject created via automated workflow test",
            credits: 4
        }, { headers });
        console.log('✅ Subject Created:', courseRes.data.courseName || courseRes.data.name, `(${courseRes.data.courseCode || courseRes.data.code})`);

        console.log('\n--- 3. Testing Upload Material ---');
        // Material upload usually requires multipart/form-data, but we support JSON links too
        const matRes = await axios.post(`${API_URL}/materials`, {
            title: "Workflow Test Material",
            subject: "Workflow Test Subject",
            type: "notes",
            link: "http://example.com/test.pdf",
            year: "1",
            section: "A",
            message: "Test material description"
        }, { headers });
        console.log('✅ Material Created:', matRes.data.title);

        console.log('\n--- 4. Verifying Student View (Fetch) ---');
        // Fetch subjects
        const subjectsRes = await axios.get(`${API_URL}/subjects`);
        const foundSubject = subjectsRes.data.find(s => s.code === courseCode);
        if (foundSubject) {
            console.log('✅ Verified: Subject appears in public list.');
        } else {
            console.error('❌ Error: Created subject NOT found in list.');
        }

        // Fetch materials
        const materialsRes = await axios.get(`${API_URL}/materials`);
        const foundMaterial = materialsRes.data.find(m => m.title === "Workflow Test Material");
        if (foundMaterial) {
            console.log('✅ Verified: Material appears in public list.');
        } else {
            console.error('❌ Error: Created material NOT found in list.');
        }

        console.log('\n🎉 WORKFLOW VERIFICATION COMPLETE. The System is working.');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    }
}

runTest();
