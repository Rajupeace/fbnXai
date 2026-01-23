const axios = require('axios');
const mongoose = require('mongoose');
const Student = require('./backend/models/Student');
const connectDB = require('./backend/config/db');

const API_URL = 'http://localhost:5000/api';

async function verifyStreak() {
    console.log("=== STREAK LOGIC VERIFICATION ===");

    // 1. Register a new student
    const sid = `STREAK_TEST_${Date.now()}`;
    const studentData = {
        studentName: "Streak Tester",
        sid: sid,
        email: `${sid}@test.com`,
        password: "password123",
        branch: "CSE",
        year: "1",
        section: "A"
    };

    try {
        console.log(`\n1. Registering Student: ${sid}`);
        await axios.post(`${API_URL}/students/register`, studentData);
        console.log("   ✅ Registered.");

        // 2. First Login (Streak should be 1)
        console.log("\n2. First Login...");
        let loginRes = await axios.post(`${API_URL}/students/login`, {
            sid: sid,
            password: "password123"
        });
        let streak = loginRes.data.studentData.stats.streak;
        console.log(`   Stats: Streak = ${streak}, LastLogin = ${loginRes.data.studentData.stats.lastLogin}`);

        if (streak === 1) console.log("   ✅ Streak Initialized to 1.");
        else console.error("   ❌ Streak failed initialization.");

        // 3. Simulate "Yesterday" Login
        console.log("\n3. Simulating 'Yesterday' via Database Update...");
        await connectDB();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(10, 0, 0, 0); // Yesterday 10 AM

        await Student.updateOne({ sid: sid }, { 'stats.lastLogin': yesterday });
        console.log("   ✅ Database modified: lastLogin set to yesterday.");

        // 4. Second Login (Consecutive Day -> Streak 2)
        console.log("\n4. Second Login (Should increment streak)...");
        loginRes = await axios.post(`${API_URL}/students/login`, {
            sid: sid,
            password: "password123"
        });
        streak = loginRes.data.studentData.stats.streak;
        console.log(`   Stats: Streak = ${streak}`);

        if (streak === 2) console.log("   ✅ Streak Incremented to 2.");
        else console.error("   ❌ Streak failed increment (Expected 2).");

        // 5. Simulate "Broken Streak" (Set last login to 2 days ago)
        console.log("\n5. Simulating 'Gap Day' (2 days ago)...");
        const gapDay = new Date();
        gapDay.setDate(gapDay.getDate() - 2);

        await Student.updateOne({ sid: sid }, { 'stats.lastLogin': gapDay });
        console.log("   ✅ Database modified: lastLogin set to 2 days ago.");

        // 6. Third Login (Broken Streak -> Reset to 1)
        console.log("\n6. Third Login (Should reset streak)...");
        loginRes = await axios.post(`${API_URL}/students/login`, {
            sid: sid,
            password: "password123"
        });
        streak = loginRes.data.studentData.stats.streak;
        console.log(`   Stats: Streak = ${streak}`);

        if (streak === 1) console.log("   ✅ Streak Reset to 1.");
        else console.error("   ❌ Streak failed reset (Expected 1).");

        // Cleanup
        console.log("\n7. Cleanup...");
        await Student.deleteOne({ sid: sid });
        console.log("   ✅ Test user deleted.");

    } catch (e) {
        console.error("!!! TEST FAILED !!!", e.message);
        if (e.response) console.error(e.response.data);
    }
    process.exit(0);
}

verifyStreak();
