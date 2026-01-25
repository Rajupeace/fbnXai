const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://127.0.0.1:27017/friendly_notebook';

async function checkData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const Faculty = require('./backend/models/Faculty');
        const Student = require('./backend/models/Student');

        const facCount = await Faculty.countDocuments();
        const stuCount = await Student.countDocuments();

        console.log(`Faculty Count: ${facCount}`);
        console.log(`Student Count: ${stuCount}`);

        if (facCount > 0) {
            const fac = await Faculty.findOne();
            console.log('Sample Faculty:', JSON.stringify(fac, null, 2));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
