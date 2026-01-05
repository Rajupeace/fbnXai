const connectDB = require('../config/db');
const mongoose = require('mongoose');

async function run() {
  if (process.env.FORCE_DROP !== 'true') {
    console.error('[drop] Aborting: destructive action requires FORCE_DROP=true');
    console.error('[drop] Set environment variable FORCE_DROP=true and re-run to confirm.');
    process.exit(1);
  }

  console.log('[drop] Connecting to MongoDB...');
  const ok = await connectDB();
  if (!ok) {
    console.error('[drop] MongoDB connection failed. Aborting.');
    process.exit(1);
  }

  try {
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    if (!cols || cols.length === 0) {
      console.log('[drop] No collections found to drop.');
    } else {
      console.log(`[drop] Found ${cols.length} collections. Dropping...`);
      for (const c of cols) {
        try {
          console.log(`[drop] Dropping collection: ${c.name}`);
          await db.dropCollection(c.name);
        } catch (err) {
          console.warn(`[drop] Failed to drop ${c.name}: ${err.message}`);
        }
      }
      console.log('[drop] Collection drop complete.');
    }

    if (process.env.DROP_DB === 'true') {
      try {
        await db.dropDatabase();
        console.log('[drop] Database dropped (DROP_DB=true).');
      } catch (err) {
        console.warn('[drop] Failed to drop database:', err.message);
      }
    }

    await mongoose.connection.close();
    console.log('[drop] Connection closed. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('[drop] Unexpected error:', err);
    try { await mongoose.connection.close(); } catch (e) {}
    process.exit(1);
  }
}

run();
