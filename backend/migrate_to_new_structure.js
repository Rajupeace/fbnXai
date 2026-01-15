const fs = require('fs');
const path = require('path');
const { DASHBOARD_PATHS, RESOURCE_MAP, ROOT_DB_PATH } = require('./dashboardConfig');

console.log("Starting Migration to New Folder Structure...");

// Ensure all target directories exist
console.log("Creating directories...");
Object.values(DASHBOARD_PATHS).forEach(p => {
    if (typeof p === 'string') {
        if (!fs.existsSync(p)) {
            console.log(`Creating ${p}`);
            fs.mkdirSync(p, { recursive: true });
        }
    } else if (typeof p === 'object' && p !== null) {
        Object.values(p).forEach(sub => {
            if (typeof sub === 'string' && !fs.existsSync(sub)) {
                console.log(`Creating ${sub}`);
                fs.mkdirSync(sub, { recursive: true });
            } else if (typeof sub === 'object' && sub !== null) {
                Object.values(sub).forEach(nested => {
                    if (typeof nested === 'string' && !fs.existsSync(nested)) {
                        console.log(`Creating ${nested}`);
                        fs.mkdirSync(nested, { recursive: true });
                    }
                });
            }
        });
    }
});

// Old data path (assuming Windows based on config)
const oldDataDir = path.join(ROOT_DB_PATH, 'data');

if (fs.existsSync(oldDataDir)) {
    console.log(`Found legacy data at ${oldDataDir}. Migrating files...`);

    const migrationMap = {
        'students.json': RESOURCE_MAP.students,
        'faculty.json': RESOURCE_MAP.faculty,
        'courses.json': RESOURCE_MAP.courses,
        'materials.json': RESOURCE_MAP.materials,
        'messages.json': RESOURCE_MAP.messages,
        'todos.json': RESOURCE_MAP.todos,
        'admin.json': RESOURCE_MAP.admin,
        'studentFaculty.json': RESOURCE_MAP.studentFaculty
    };

    Object.entries(migrationMap).forEach(([oldFile, newPath]) => {
        const oldPath = path.join(oldDataDir, oldFile);
        if (fs.existsSync(oldPath)) {
            try {
                // Ensure target dir exists (for nested specific files)
                const targetDir = path.dirname(newPath);
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const data = fs.readFileSync(oldPath);
                fs.writeFileSync(newPath, data);
                console.log(`✅ Migrated ${oldFile} -> ${newPath}`);
            } catch (e) {
                console.error(`❌ Failed to migrate ${oldFile}:`, e);
            }
        } else {
            console.log(`Skipping ${oldFile} (not found in old data)`);
        }
    });

    console.log("Migration complete.");
    console.log("You can delete the old 'data' folder manually after verification.");
} else {
    console.log("No legacy 'data' folder found. Initializing empty structure.");
    // Create empty files if they don't exist
    Object.values(RESOURCE_MAP).forEach(p => {
        if (!fs.existsSync(p)) {
            const targetDir = path.dirname(p);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
            fs.writeFileSync(p, JSON.stringify([], null, 2));
            console.log(`Created empty ${path.basename(p)}`);
        }
    });
}
