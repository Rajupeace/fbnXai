const fs = require('fs');
const path = require('path');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    try {
        fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
        console.error("Failed to create data directory:", e);
    }
}

/**
 * Simple file-based database helper
 * @param {string} collectionName - Name of the JSON file (without extension)
 * @param {any} defaultData - Default data if file doesn't exist
 */
const dbHelper = (collectionName, defaultData = []) => {
    const filePath = path.join(dataDir, `${collectionName}.json`);

    return {
        read: () => {
            try {
                if (!fs.existsSync(filePath)) {
                    // Initialize if missing
                    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
                    return defaultData;
                }
                const raw = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(raw);
            } catch (error) {
                console.error(`[dbHelper] Read Error (${collectionName}):`, error.message);
                return defaultData;
            }
        },
        write: (data) => {
            try {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                return true;
            } catch (error) {
                console.error(`[dbHelper] Write Error (${collectionName}):`, error.message);
                return false;
            }
        }
    };
};

module.exports = dbHelper;
