const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

const Schedule = require('./models/Schedule');

const seedSchedule = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for Schedule Seeding');

        // Clean existing schedule for Dr. Sarah Connor
        await Schedule.deleteMany({ faculty: /Sarah Connor/i });
        console.log('🧹 Cleared old schedules');

        const schedules = [
            {
                day: 'Monday',
                time: '09:00 - 10:00',
                subject: 'Advanced AI',
                faculty: 'Dr. Sarah Connor',
                room: 'Lab 301',
                type: 'Theory',
                year: 4,
                section: 'A',
                branch: 'CSE',
                semester: 1
            },
            {
                day: 'Monday',
                time: '11:00 - 13:00',
                subject: 'Advanced AI Lab',
                faculty: 'Dr. Sarah Connor',
                room: 'AI Center',
                type: 'Lab',
                year: 4,
                section: 'A',
                branch: 'CSE',
                semester: 1,
                batch: 'B1'
            },
            {
                day: 'Tuesday',
                time: '14:00 - 15:00',
                subject: 'Web Technologies',
                faculty: 'Dr. Sarah Connor',
                room: 'Room 204',
                type: 'Theory',
                year: 3,
                section: 'B',
                branch: 'CSE',
                semester: 1
            },
            {
                day: 'Wednesday',
                time: '10:00 - 11:00',
                subject: 'Advanced AI',
                faculty: 'Dr. Sarah Connor',
                room: 'Room 303',
                type: 'Theory',
                year: 4,
                section: 'A',
                branch: 'CSE',
                semester: 1
            }
        ];

        await Schedule.insertMany(schedules);
        console.log(`📅 Created ${schedules.length} schedule entries for Dr. Sarah Connor`);

        console.log('\n✅ SCHEDULE SEEDING COMPLETE!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Seeding Failed:', err);
        process.exit(1);
    }
};

seedSchedule();
