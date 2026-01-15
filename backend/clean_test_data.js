const fs = require('fs');
const { RESOURCE_MAP } = require('./dashboardConfig');

console.log("🧹 Cleaning up Verification Test Data...");

const cleanFile = (name, idField, idValue) => {
    const p = RESOURCE_MAP[name];
    if (fs.existsSync(p)) {
        try {
            const data = JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
            const initialLen = data.length;
            const filtered = data.filter(item => item[idField] !== idValue && item.id !== idValue && item._id !== idValue);

            if (filtered.length < initialLen) {
                fs.writeFileSync(p, JSON.stringify(filtered, null, 2));
                console.log(`   ✅ Removed test entry from ${name}`);
            }
        } catch (e) {
            console.error(`   ❌ Failed to clean ${name}`, e.message);
        }
    }
};

cleanFile('students', 'sid', 'TEST-S-001');
cleanFile('faculty', 'facultyId', 'TEST-F-001');
cleanFile('messages', 'id', 'msg-test-001');
cleanFile('materials', 'id', 'mat-test-001');

console.log("✨ System restored to clean state.");
