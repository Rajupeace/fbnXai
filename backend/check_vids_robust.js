const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Material = require('./models/Material');

async function checkAllPossibleDBs() {
    const uris = [
        process.env.MONGO_URI,
        'mongodb://127.0.0.1:27017/fbn_xai_system',
        'mongodb://localhost:27017/fbn_xai_system',
        'mongodb://127.0.0.1:27017/vuAiAgent',
        'mongodb://localhost:27017/vuAiAgent'
    ].filter(Boolean);

    for (const uri of uris) {
        console.log(`Trying ${uri}...`);
        try {
            const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            console.log('✅ Connected!');
            const count = await Material.countDocuments({ type: 'videos' });
            console.log(`Found ${count} videos`);
            if (count > 0) {
                const videos = await Material.find({ type: 'videos' }).limit(5);
                videos.forEach(v => console.log(` - ${v.title} (${v.subject}): ${v.fileUrl}`));
            }
            await mongoose.disconnect();
            if (count > 0) break;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }
}

checkAllPossibleDBs();
