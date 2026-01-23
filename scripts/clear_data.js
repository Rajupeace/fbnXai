const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { DASHBOARD_PATHS, RESOURCE_MAP } = require('../backend/dashboardConfig');

// MongoDB Models (Partial definition just for deletion or use raw collection)
const connectDB = require('../backend/config/db');

async function clearData() {
    console.log("=== DATA CLEARANCE PROTOCOL INITIATED ===");

    // 1. Connect to MongoDB
    const isConnected = await connectDB();
    if (isConnected) {
        try {
            console.log("\n[MongoDB] Clearing Collections...");

            // We use raw collection access to be sure, or models if we required them
            const collections = [
                'AdminDashboardDB_Sections_Students',
                'AdminDashboardDB_Sections_Faculty',
                'AdminDashboardDB_Sections_Courses'
            ];

            for (const colName of collections) {
                try {
                    const col = mongoose.connection.collection(colName);
                    const count = await col.countDocuments();
                    if (count > 0) {
                        await col.deleteMany({});
                        console.log(`   ✅ Cleared ${count} records from ${colName}`);
                    } else {
                        console.log(`   ℹ️  Collection ${colName} was already empty.`);
                    }
                } catch (e) {
                    console.warn(`   ⚠️  Error clearing ${colName}:`, e.message);
                }
            }
        } catch (e) {
            console.error("   ❌ MongoDB Error:", e);
        }
    } else {
        console.warn("   ⚠️  MongoDB not connected. Skipping DB clear.");
    }

    // 2. Clear File-Based Storage
    console.log("\n[FileSystem] Clearing Local JSON Data...");

    // Define files to clear (reset to empty array)
    const filesToClear = [
        RESOURCE_MAP['students'],
        RESOURCE_MAP['faculty'],
        RESOURCE_MAP['courses']
    ];

    filesToClear.forEach(filePath => {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.writeFileSync(filePath, '[]');
                console.log(`   ✅ Wiped content of: ${path.basename(filePath)}`);
            } catch (e) {
                console.error(`   ❌ Failed to wipe ${path.basename(filePath)}:`, e.message);
            }
        } else {
            console.log(`   ℹ️  File not found (clean): ${filePath ? path.basename(filePath) : 'unknown'}`);
        }
    });

    console.log("\n=== DATA CLEARANCE COMPLETE ===");
    process.exit(0);
}

// Run
clearData();
