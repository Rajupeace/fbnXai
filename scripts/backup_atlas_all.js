require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not found in environment. Aborting backup.');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { maxPoolSize: 10 });
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    const outDir = path.join(__dirname, '..', 'backups', 'atlas-before-wipe');
    fs.mkdirSync(outDir, { recursive: true });

    if (!cols.length) {
      console.log('No collections found in Atlas. Nothing to back up.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${cols.length} collections — exporting to ${outDir}`);
    for (const c of cols) {
      const name = c.name;
      try {
        const docs = await db.collection(name).find({}).toArray();
        const outPath = path.join(outDir, `${name}.json`);
        fs.writeFileSync(outPath, JSON.stringify(docs, null, 2));
        console.log(`  ✅ ${name} -> ${outPath} [${docs.length} docs]`);
      } catch (err) {
        console.warn(`  ⚠️  Failed export ${name}: ${err.message}`);
      }
    }

    await mongoose.disconnect();
    console.log('\nBackup complete.');
  } catch (err) {
    console.error('Backup failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
