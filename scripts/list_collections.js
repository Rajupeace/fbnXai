require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { maxPoolSize: 5 });
    const db = mongoose.connection.db;
    const cols = await db.listCollections().toArray();
    if (!cols.length) {
      console.log('No collections found');
      await mongoose.disconnect();
      return;
    }
    for (const c of cols) {
      const n = c.name;
      const count = await db.collection(n).countDocuments();
      console.log(`${n}\t${count}`);
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error('ERROR:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
