// dedupe-maintenance.js
// Dry-run by default. Use --apply to actually remove duplicates.
// Usage: node dedupe-maintenance.js [--apply]

require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Material = require('../models/Material');

const uploadsPath = process.env.UPLOADS_PATH || (require('../dashboardConfig').DASHBOARD_PATHS || {}).uploads || path.join(process.cwd(),'uploads');

const apply = process.argv.includes('--apply');

async function findDuplicatesByKey(model, key) {
  const pipeline = [
    { $group: { _id: `$${key}`, ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { _id: { $ne: null }, count: { $gt: 1 } } }
  ];
  return model.aggregate(pipeline).exec();
}

async function dedupeCollection(model, key, label) {
  console.log(`\nChecking ${label} for duplicates by ${key}...`);
  const dups = await findDuplicatesByKey(model, key);
  if (!dups.length) {
    console.log(`  No duplicates found for ${label} by ${key}.`);
    return { label, key, duplicates: 0 };
  }

  let removed = 0;
  for (const g of dups) {
    const ids = g.ids.map(i => i.toString()).sort();
    // Keep the first id, remove others
    const keep = ids[0];
    const toRemove = ids.slice(1);
    console.log(`  Duplicate key='${g._id}' count=${g.count}  keep=${keep} remove=${toRemove.join(',')}`);
    if (apply && toRemove.length) {
      const res = await model.deleteMany({ _id: { $in: toRemove } });
      removed += res.deletedCount || 0;
      console.log(`    Removed ${res.deletedCount || 0} documents.`);
    }
  }
  return { label, key, duplicates: dups.length, removed };
}

async function findFileDuplicates(dir) {
  if (!fs.existsSync(dir)) return [];
  const map = new Map();
  const files = [];
  function walk(d) {
    const items = fs.readdirSync(d);
    for (const it of items) {
      const p = path.join(d, it);
      try {
        const st = fs.statSync(p);
        if (st.isDirectory()) walk(p);
        else files.push(p);
      } catch (e) {}
    }
  }
  walk(dir);
  for (const f of files) {
    try {
      const buf = fs.readFileSync(f);
      const hash = crypto.createHash('sha1').update(buf).digest('hex');
      if (!map.has(hash)) map.set(hash, []);
      map.get(hash).push(f);
    } catch (e) {}
  }
  const dupGroups = [];
  for (const [hash, arr] of map.entries()) if (arr.length > 1) dupGroups.push({ hash, files: arr });
  return dupGroups;
}

async function reconcileMaterialFiles(dupGroups) {
  // For each group, pick canonical file (first) and update materials pointing to duplicates
  let totalFixes = 0;
  for (const g of dupGroups) {
    const canonical = g.files[0];
    const duplicates = g.files.slice(1);
    // For each duplicate path, find materials referencing it
    for (const dup of duplicates) {
      const relDup = path.relative(process.cwd(), dup).replace(/\\/g, '/');
      const relCanon = path.relative(process.cwd(), canonical).replace(/\\/g, '/');
      // Try to update materials where fileUrl matches dup or contains dup filename
      const docs = await Material.find({ $or: [ { fileUrl: dup }, { fileUrl: relDup }, { fileUrl: { $regex: path.basename(dup) } } ] }).lean();
      if (docs && docs.length) {
        console.log(`  Materials pointing to duplicate file ${dup}: ${docs.map(d=>d._id).join(',')}`);
        if (apply) {
          for (const doc of docs) {
            await Material.updateOne({ _id: doc._id }, { $set: { fileUrl: canonical, url: canonical } });
            totalFixes++;
          }
          // Optionally remove duplicate file
          try { fs.unlinkSync(dup); console.log(`    Removed duplicate file ${dup}`); } catch(e) { console.warn('    Could not remove file', e && e.message); }
        }
      }
    }
  }
  return totalFixes;
}

async function main() {
  console.log('Starting dedupe-maintenance (dry-run unless --apply)');
  await connectDB();
  console.log('Connected to MongoDB');

  const results = [];
  results.push(await dedupeCollection(Student, 'email', 'Students'));
  results.push(await dedupeCollection(Student, 'sid', 'Students by SID'));
  results.push(await dedupeCollection(Faculty, 'facultyId', 'Faculty'));
  results.push(await dedupeCollection(Faculty, 'email', 'Faculty by email'));
  results.push(await dedupeCollection(Course, 'courseCode', 'Courses'));
  results.push(await dedupeCollection(Material, 'fileUrl', 'Materials by fileUrl'));

  console.log('\nScanning uploads folder for duplicate files (by SHA1)...');
  const dupGroups = await findFileDuplicates(uploadsPath);
  if (!dupGroups.length) console.log('  No duplicate files found');
  else console.log(`  Found ${dupGroups.length} duplicate file groups`);

  let fixes = 0;
  if (dupGroups.length) {
    fixes = await reconcileMaterialFiles(dupGroups);
    console.log(`  Reconciled ${fixes} material references${apply? ' and removed duplicate files':''}`);
  }

  console.log('\nSummary:');
  console.log(results);
  console.log('File duplicate groups:', dupGroups.length);
  console.log('Material file reference fixes performed:', fixes);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  console.log('Done.');
}

main().catch(err => {
  console.error('Error in dedupe script:', err);
  process.exit(1);
});
