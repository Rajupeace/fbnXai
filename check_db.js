const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Course = require('./backend/models/Course');
        const courses = await Course.find({ name: /Compiler Design/i });
        console.log('Compiler Design Courses:', JSON.stringify(courses, null, 2));

        const overrides = await Course.find({ code: 'EMPTY__OVERRIDE' });
        console.log('Overrides:', JSON.stringify(overrides, null, 2));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
