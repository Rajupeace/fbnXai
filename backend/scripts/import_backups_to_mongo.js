/*
  Import JSON backups into MongoDB collections.
  Usage: node import_backups_to_mongo.js [path-to-backup-folder]
  Example: node import_backups_to_mongo.js ../../backups/latest

  The script maps common filenames to Mongoose models and inserts documents.
  It will NOT delete existing documents; it attempts upsert by _id when present.
*/
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const backupDir = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', '..', 'backups', 'latest');

const modelMap = {
  students: '../models/Student',
  faculty: '../models/Faculty',
  materials: '../models/Material',
  schedules: '../models/Schedule',
  attendance: '../models/Attendance',
  enrollments: '../models/Enrollment',
  messages: '../models/Message',
  todos: '../models/Todo',
  roadmap: '../models/Roadmap',
  studentprogress: '../models/StudentProgress'
};

const run = async () => {
  console.log('Connecting to MongoDB...');
  const ok = await connectDB();
  if (!ok) {
    console.error('MongoDB connection failed. Aborting.');
    process.exit(1);
  }

  if (!fs.existsSync(backupDir)) {
    console.error('Backup directory not found:', backupDir);
    process.exit(1);
  }

  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('No JSON files found in', backupDir);
    process.exit(0);
  }

  for (const file of files) {
    const name = path.basename(file, '.json').toLowerCase();
    const modelPath = modelMap[name] || null;
    const filePath = path.join(backupDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const docs = JSON.parse(raw);
      if (!Array.isArray(docs)) {
        console.warn('Skipping', file, '- not an array');
        continue;
      }

      if (!modelPath) {
        console.warn('No model mapping for', name, '- skipping file import');
        continue;
      }

      console.log(`Importing ${docs.length} docs into ${modelPath} from ${file}`);
      const Model = require(modelPath);

      let inserted = 0;
      for (const doc of docs) {
        try {
          if (doc._id) {
            await Model.updateOne({ _id: doc._id }, { $set: doc }, { upsert: true });
          } else {
            await Model.create(doc);
          }
          inserted++;
        } catch (e) {
          console.warn('Failed to import doc (skipping):', e.message);
        }
      }
      console.log(`Finished ${file}: ${inserted}/${docs.length} inserted/upserted.`);
    } catch (err) {
      console.error('Error reading or parsing', filePath, err.message);
    }
  }

  console.log('Import complete. Closing connection.');
  mongoose.disconnect();
};

run().catch(err => {
  console.error('Import script failed:', err);
  process.exit(1);
});
