const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:5000/api';

async function verifySync() {
    console.log("=== AUTOMATIC SYNC VERIFICATION SYSTEM ===");
    console.log("Objective: Verify Database updates reflect in Dashboard Sections & DivCards");

    // 1. Snapshot Initial State (Admin Dashboard - DivCard: Total Students)
    try {
        console.log("\n1. Checking Admin Dashboard Data (DivCards)...");
        const initStudents = await axios.get(`${API_URL}/students`);
        const initCount = initStudents.data.length;
        console.log(`   [INITIAL] Total Students: ${initCount}`);

        // 2. Perform Database Update (Add New Student)
        console.log("\n2. Simulating Database Update...");
        const newStudent = {
            sid: `TEST-${Date.now()}`,
            studentName: "Sync Test User",
            email: `test${Date.now()}@example.com`,
            password: "password123",
            branch: "CSE",
            year: "1",
            section: "A"
        };

        // This is the "Database Update" action
        await axios.post(`${API_URL}/students/register`, newStudent);
        console.log("   [SUCCESS] New Student Inserted into Database.");

        // 3. Verify Update Reflected (Admin DivCard Check)
        const updatedStudents = await axios.get(`${API_URL}/students`);
        const updatedCount = updatedStudents.data.length;
        console.log(`   [UPDATED] Total Students: ${updatedCount}`);

        if (updatedCount === initCount + 1) {
            console.log("   ✅ ADMIN DIVCARDS: SYNC CONFIRMED (Count updated automatically)");
        } else {
            console.log("   ❌ ADMIN DIVCARDS: SYNC FAILED");
        }

        // 4. Verify Student Dashboard Section (Profile/Overview)
        // We log in as the student to check their specific dashboard sections
        console.log("\n3. Checking Student Dashboard Sections...");
        const loginRes = await axios.post(`${API_URL}/students/login`, {
            sid: newStudent.sid,
            password: newStudent.password
        });
        const token = loginRes.data.token;
        const studentId = loginRes.data.studentData.sid;

        const overviewRes = await axios.get(`${API_URL}/students/${studentId}/overview`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (overviewRes.data && overviewRes.data.student && overviewRes.data.student.name === newStudent.studentName) {
            console.log("   ✅ STUDENT SECTIONS: SYNC CONFIRMED (Data retrieved from DB)");
            console.log("      - Name: " + overviewRes.data.student.name);
            console.log("      - Branch: " + overviewRes.data.student.branch);
        } else {
            console.log("   ❌ STUDENT SECTIONS: SYNC FAILED");
        }

        // 5. Cleanup
        console.log("\n4. Cleaning up Test Data...");
        // Assuming we have a delete endpoint or just leaving it for now (it's a test user)
        // Ideally: await axios.delete(`${API_URL}/students/${studentId}`); 
        console.log("   [INFO] Test completed. You can delete user " + newStudent.sid + " manually if needed.");

    } catch (e) {
        console.error("!!! VERIFICATION ERROR !!!");
        console.error(e.message);
        if (e.response) console.error(e.response.data);
    }
}

verifySync();
