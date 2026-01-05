const path = require('path');
const fs = require('fs');
const connectDB = require('../config/db');
const mongoose = require('mongoose');

const dataDir = path.join(__dirname, '..', 'data');

const filesToCollections = {
  'admin.json': 'admins',
  'faculty.json': 'faculties',
  'students.json': 'students',
  'materials.json': 'materials',
  'messages.json': 'messages',
  'attendance.json': 'attendances',
  'courses.json': 'courses',
  'studentFaculty.json': 'studentFaculty',
  'todos.json': 'todos',
  'chatHistory.json': 'chatHistory'
};

async function readJson(filePath) {
  try {
    const txt = fs.readFileSync(filePath, 'utf8').trim();
    if (!txt) return null;
    // Sometimes files contain multiple JSON arrays or lines; try to parse first valid JSON
    try {
      return JSON.parse(txt);
    } catch (e) {
      // Try to fix common trailing characters
      const fixed = txt.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(Boolean).join('\n');
      return JSON.parse(fixed);
    }
  } catch (e) {
    return null;
  }
}

async function importFile(fileName) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`[import] Skipping ${fileName} (not found)`);
    return;
  }

  const data = await readJson(filePath);
  if (!data) {
    console.log(`[import] No data found in ${fileName} (empty or invalid)`);
    return;
  }

  const collName = filesToCollections[fileName] || path.basename(fileName, '.json');
  const coll = mongoose.connection.collection(collName);
  try {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        console.log(`[import] ${fileName} contains empty array — skipping`);
        return;
      }
      console.log(`[import] Clearing collection '${collName}' and inserting ${data.length} documents from ${fileName}`);
      await coll.deleteMany({});
      // Normalize _id fields: remove id if present to let Mongo assign _id or convert id->_id if needed
      const toInsert = data.map(d => {
        const copy = { ...d };
        if (copy.id && !copy._id) {
          copy._id = copy.id;
          delete copy.id;
        }
        return copy;
      });
      await coll.insertMany(toInsert);
    } else if (typeof data === 'object') {
      console.log(`[import] Upserting single document into '${collName}' from ${fileName}`);
      // For admin.json etc., use a key if available
      const key = data.adminId ? { adminId: data.adminId } : (data.sid ? { sid: data.sid } : null);
      if (key) {
        await coll.replaceOne(key, data, { upsert: true });
      } else {
        // No key — store as single document by clearing collection
        await coll.deleteMany({});
        await coll.insertOne(data);
      }
    } else {
      console.log(`[import] Unsupported data type in ${fileName}`);
    }
  } catch (err) {
    console.error(`[import] Error importing ${fileName}:`, err.message || err);
  }
}

async function run() {
  console.log('[import] Connecting to MongoDB...');
  const ok = await connectDB();
  if (!ok) {
    console.error('[import] MongoDB connection failed. Aborting import.');
    process.exit(1);
  }

  for (const fileName of Object.keys(filesToCollections)) {
    await importFile(fileName);
  }

  console.log('[import] Import complete. Closing connection.');
  await mongoose.connection.close();
  process.exit(0);
}

run().catch(err => {
  console.error('[import] Unexpected error:', err);
  process.exit(1);
});
