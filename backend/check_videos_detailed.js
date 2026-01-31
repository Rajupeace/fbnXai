const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Material = require('./models/Material');

async function checkVideosDetailed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const videos = await Material.find({ type: 'videos' });
        const subjects = [...new Set(videos.map(v => v.subject))];
        console.log('Subjects with videos:', subjects);

        const advancedVideos = await Material.find({ type: 'videos', isAdvanced: true });
        console.log(`Advanced videos: ${advancedVideos.length}`);
        advancedVideos.forEach(v => {
            console.log(`- Title: ${v.title}, Subject: ${v.subject}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkVideosDetailed();
