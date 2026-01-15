const fs = require('fs');
const http = require('http');
const path = require('path');
const { DASHBOARD_PATHS } = require('./dashboardConfig');

console.log("🧪 Starting Live Sync Verification Test...");

// 1. Setup SSE Listener
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/stream',
    method: 'GET',
    headers: {
        'Accept': 'text/event-stream'
    }
};

const req = http.request(options, (res) => {
    console.log(`✅ Connected to SSE Stream (Status: ${res.statusCode})`);

    res.on('data', (chunk) => {
        const msg = chunk.toString();
        if (msg.includes('retry:')) return; // Ignore heartbeat

        // Parse SSE data
        const match = msg.match(/data: (.+)/);
        if (match) {
            try {
                const data = JSON.parse(match[1]);
                console.log("📩 Received SSE Update:", data);

                if (data.resource === 'students' && data.action === 'update' && data.from === 'filesystem') {
                    console.log("\n🎉 TEST PASSED: File System Change -> Detected -> Broadcasted.");
                    process.exit(0);
                }
            } catch (e) {
                console.log("Raw message:", msg);
            }
        }
    });

    // 2. Perform File Write after short delay
    setTimeout(() => {
        console.log("\n📝 Simulating External Data Change...");
        console.log("   Target: AdminDashboardDB/Sections/Students/students.json");

        try {
            const studentFile = path.join(DASHBOARD_PATHS.AdminDashboardDB.SectionFolders.Students, 'students.json');

            let currentData = [];
            if (fs.existsSync(studentFile)) {
                currentData = JSON.parse(fs.readFileSync(studentFile, 'utf8'));
            }

            // Add dummy test student
            currentData.push({
                id: 'TEST_SYNC_' + Date.now(),
                name: 'Live Sync Tester',
                role: 'test'
            });

            fs.writeFileSync(studentFile, JSON.stringify(currentData, null, 2));
            console.log("   ✅ File Updated Successfully.");
            console.log("   ⏳ Waiting for Backend to Broadcast...");

        } catch (e) {
            console.error("   ❌ Write Failed:", e.message);
            process.exit(1);
        }
    }, 2000);
});

req.on('error', (e) => {
    console.error(`❌ Connection Error: ${e.message}`);
    console.log("   Make sure 'npm run dev' is running!");
    process.exit(1);
});

req.end();
