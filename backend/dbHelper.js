const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
let FileCache;
try { FileCache = require('./models/FileCache'); } catch (e) { FileCache = null; }

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
                    // Prefer MongoDB FileCache when connected
                    if (mongoose.connection && mongoose.connection.readyState === 1 && FileCache) {
                        return FileCache.findOne({ name: collectionName }).then(doc => {
                            if (doc && doc.data !== undefined) return doc.data;
                            // fallback to file if DB doc missing
                            if (!fs.existsSync(filePath)) {
                                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
                                return defaultData;
                            }
                            const raw = fs.readFileSync(filePath, 'utf-8');
                            return JSON.parse(raw);
                        }).catch(err => {
                            console.warn('[dbHelper] Mongo read failed, falling back to file:', err.message);
                            if (!fs.existsSync(filePath)) {
                                fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
                                return defaultData;
                            }
                            const raw = fs.readFileSync(filePath, 'utf-8');
                            return JSON.parse(raw);
                        });
                    }

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
                    // If Mongo connected, persist into FileCache collection instead of file
                    if (mongoose.connection && mongoose.connection.readyState === 1 && FileCache) {
                        FileCache.findOneAndUpdate({ name: collectionName }, { data, updatedAt: new Date() }, { upsert: true }).catch(err => {
                            console.warn('[dbHelper] Mongo write failed, falling back to file:', err.message);
                            try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); } catch (e) { console.error(e.message); }
                        });
                        return true;
                    }

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
