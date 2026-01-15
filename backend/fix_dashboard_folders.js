const fs = require('fs');
const path = require('path');
const { DASHBOARD_PATHS, RESOURCE_MAP } = require('./dashboardConfig');

console.log("🚀 Initializing Comprehensive Dashboard Folder Structure on D:\\ Drive...");

// Recursive function to create directories
const createDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`   ✅ Created: ${dirPath}`);
        } catch (e) {
            console.error(`   ❌ Error creating ${dirPath}:`, e.message);
        }
    }
};

// 1. Create Root Directories for each Dashboard
Object.keys(DASHBOARD_PATHS).forEach(key => {
    const dbPaths = DASHBOARD_PATHS[key];
    if (dbPaths && typeof dbPaths === 'object' && dbPaths.root) {
        console.log(`\n📂 Setting up ${key}...`);
        createDir(dbPaths.root);
        createDir(dbPaths.Sections);
        createDir(dbPaths.DivBoxCards);

        // Create specific SECTION folders
        if (dbPaths.SectionFolders) {
            Object.values(dbPaths.SectionFolders).forEach(folder => createDir(folder));
        }

        // Create specific CARD folders
        if (dbPaths.CardFolders) {
            Object.values(dbPaths.CardFolders).forEach(folder => createDir(folder));
        }
    } else if (typeof dbPaths === 'string') {
        createDir(dbPaths); // e.g. uploads
    }
});

// 2. Ensure JSON Data Files Exist in their new homes
console.log("\n📄 Verifying Data Files...");
Object.entries(RESOURCE_MAP).forEach(([key, filePath]) => {
    // Ensure parent dir exists (redundant safety check)
    createDir(path.dirname(filePath));

    if (!fs.existsSync(filePath)) {
        console.log(`   Stubbing file: ${path.basename(filePath)}`);
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
});

console.log("\n🎉 Dashboard Storage Structure Fixed & Synchronized.");
console.log("   D:\\fbn_database is now heavily structured for Admin, Student, and Faculty dashboards.");
