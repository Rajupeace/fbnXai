const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Material = require('./models/Material');

async function checkVideos() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const videos = await Material.find({ type: 'videos' });
        console.log(`Found ${videos.length} videos`);
        videos.forEach(v => {
            console.log(`- Title: ${v.title}, Subject: ${v.subject}, Advanced: ${v.isAdvanced}, URL: ${v.fileUrl}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkVideos();
