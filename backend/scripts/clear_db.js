const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import Config
const { RESOURCE_MAP } = require('../dashboardConfig');
const connectDB = require('../config/db');

async function clearData() {
    console.log("=== ADMIN DASHBOARD DATA CLEARANCE INITIATED ===");

    // 1. Connect to MongoDB
    const isConnected = await connectDB();
    if (isConnected) {
        try {
            console.log("\n[MongoDB] Wiping Collections...");

            // Collections to clear
            const collections = [
                'AdminDashboardDB_Sections_Students',
                'AdminDashboardDB_Sections_Faculty',
                'AdminDashboardDB_Sections_Courses',
                'AdminDashboardDB_Sections_Messages'
            ];

            for (const colName of collections) {
                try {
                    // Check if collection exists
                    const collectionsList = await mongoose.connection.db.listCollections({ name: colName }).toArray();

                    if (collectionsList.length > 0) {
                        const col = mongoose.connection.collection(colName);
                        // Delete all documents
                        const result = await col.deleteMany({});
                        console.log(`   ✅ Cleared ${result.deletedCount} records from ${colName}`);
                    } else {
                        console.log(`   ℹ️  Collection ${colName} does not exist (already clean).`);
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

    // 2. Clear File-Based Storage (Sync files)
    console.log("\n[FileSystem] Clearing Local JSON Data...");

    // We only want to clear the specific resource files, not everything
    const keysToClear = ['students', 'faculty', 'courses', 'messages'];

    keysToClear.forEach(key => {
        const filePath = RESOURCE_MAP[key];
        if (filePath) {
            if (fs.existsSync(filePath)) {
                try {
                    fs.writeFileSync(filePath, '[]');
                    console.log(`   ✅ Wiped content of: ${key} (${path.basename(filePath)})`);
                } catch (e) {
                    console.error(`   ❌ Failed to wipe ${key}:`, e.message);
                }
            } else {
                console.log(`   ℹ️  File not found (already clean): ${key}`);
            }
        }
    });

    console.log("\n=== DATA CLEARANCE COMPLETE ===");
    console.log("Please refresh your dashboard to see the empty state.");

    // Close connection
    try { await mongoose.connection.close(); } catch (e) { }
    process.exit(0);
}

// Run
clearData();
