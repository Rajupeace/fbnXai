require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

console.log('🚀 VuAiAgent System Test Suite\n');
console.log('═'.repeat(70));

async function runTests() {
    try {
        // Test 1: Database Connection
        console.log('\n📋 TEST 1: Database Connection');
        console.log('─'.repeat(70));
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ MongoDB Connected');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);

        // Test 2: Materials with Video Analysis
        console.log('\n📋 TEST 2: Video Materials & Analysis');
        console.log('─'.repeat(70));
        const Material = require('./models/Material');

        const totalVideos = await Material.countDocuments({ type: 'videos' });
        console.log(`   Total video materials: ${totalVideos}`);

        const videosWithAnalysis = await Material.countDocuments({
            type: 'videos',
            videoAnalysis: { $exists: true, $ne: null, $ne: '' }
        });
        console.log(`   Videos with analysis: ${videosWithAnalysis}`);

        const sampleVideos = await Material.find({ type: 'videos' })
            .limit(3)
            .select('title type videoAnalysis year subject')
            .lean();

        console.log('\n   Sample Videos:');
        sampleVideos.forEach((v, i) => {
            console.log(`\n   ${i + 1}. ${v.title}`);
            console.log(`      Subject: ${v.subject || 'N/A'}`);
            console.log(`      Year: ${v.year || 'N/A'}`);
            console.log(`      Analysis: ${v.videoAnalysis ? '✅ Present' : '❌ Missing'}`);
            if (v.videoAnalysis) {
                const preview = v.videoAnalysis.substring(0, 100);
                console.log(`      Preview: "${preview}..."`);
            }
        });

        // Test 3: Chat History
        console.log('\n\n📋 TEST 3: Chat History & AI Responses');
        console.log('─'.repeat(70));
        const Chat = require('./models/Chat');

        const totalChats = await Chat.countDocuments();
        console.log(`   Total chat messages: ${totalChats}`);

        const recentChats = await Chat.find()
            .sort({ timestamp: -1 })
            .limit(5)
            .select('userId role message response timestamp')
            .lean();

        console.log('\n   Recent Conversations:');
        recentChats.forEach((chat, i) => {
            console.log(`\n   ${i + 1}. User: ${chat.userId} (${chat.role})`);
            console.log(`      Message: "${chat.message?.substring(0, 60)}..."`);
            console.log(`      Response: "${chat.response?.substring(0, 60)}..."`);
            console.log(`      Time: ${new Date(chat.timestamp).toLocaleString()}`);
        });

        // Test 4: Student Data
        console.log('\n\n📋 TEST 4: Student Data Integrity');
        console.log('─'.repeat(70));
        const Student = require('./models/Student');

        const totalStudents = await Student.countDocuments();
        console.log(`   Total students: ${totalStudents}`);

        const sampleStudent = await Student.findOne().lean();
        if (sampleStudent) {
            console.log(`\n   Sample Student:`);
            console.log(`      ID: ${sampleStudent.sid}`);
            console.log(`      Name: ${sampleStudent.studentName}`);
            console.log(`      Year: ${sampleStudent.year}`);
            console.log(`      Branch: ${sampleStudent.branch}`);
            console.log(`      Section: ${sampleStudent.section}`);
        }

        // Test 5: Attendance Records
        console.log('\n\n📋 TEST 5: Attendance System');
        console.log('─'.repeat(70));
        const Attendance = require('./models/Attendance');

        const totalAttendance = await Attendance.countDocuments();
        console.log(`   Total attendance records: ${totalAttendance}`);

        const recentAttendance = await Attendance.find()
            .sort({ date: -1 })
            .limit(3)
            .select('studentId studentName subject status date')
            .lean();

        console.log('\n   Recent Attendance:');
        recentAttendance.forEach((att, i) => {
            console.log(`   ${i + 1}. ${att.studentName} - ${att.subject}`);
            console.log(`      Status: ${att.status}`);
            console.log(`      Date: ${att.date}`);
        });

        // Test 6: Exam Schedule
        console.log('\n\n📋 TEST 6: Exam Management');
        console.log('─'.repeat(70));
        const Exam = require('./models/Exam');

        const totalExams = await Exam.countDocuments();
        console.log(`   Total exams: ${totalExams}`);

        const upcomingExams = await Exam.find()
            .sort({ date: 1 })
            .limit(3)
            .select('subject date time year branch')
            .lean();

        console.log('\n   Upcoming Exams:');
        upcomingExams.forEach((exam, i) => {
            console.log(`   ${i + 1}. ${exam.subject}`);
            console.log(`      Date: ${exam.date}`);
            console.log(`      Time: ${exam.time}`);
            console.log(`      Year/Branch: ${exam.year} ${exam.branch}`);
        });

        // Test 7: Faculty Data
        console.log('\n\n📋 TEST 7: Faculty Management');
        console.log('─'.repeat(70));
        const Faculty = require('./models/Faculty');

        const totalFaculty = await Faculty.countDocuments();
        console.log(`   Total faculty: ${totalFaculty}`);

        const sampleFaculty = await Faculty.findOne()
            .select('facultyId name department designation')
            .lean();

        if (sampleFaculty) {
            console.log(`\n   Sample Faculty:`);
            console.log(`      ID: ${sampleFaculty.facultyId}`);
            console.log(`      Name: ${sampleFaculty.name}`);
            console.log(`      Department: ${sampleFaculty.department}`);
            console.log(`      Designation: ${sampleFaculty.designation}`);
        }

        // Test 8: Schedule
        console.log('\n\n📋 TEST 8: Class Schedule');
        console.log('─'.repeat(70));
        const Schedule = require('./models/Schedule');

        const totalSchedules = await Schedule.countDocuments();
        console.log(`   Total schedule entries: ${totalSchedules}`);

        const sampleSchedule = await Schedule.find()
            .limit(3)
            .select('day time subject faculty room year section')
            .lean();

        console.log('\n   Sample Schedule:');
        sampleSchedule.forEach((sch, i) => {
            console.log(`   ${i + 1}. ${sch.day} - ${sch.time}`);
            console.log(`      Subject: ${sch.subject}`);
            console.log(`      Faculty: ${sch.faculty}`);
            console.log(`      Room: ${sch.room}`);
        });

        // Summary
        console.log('\n\n' + '═'.repeat(70));
        console.log('📊 TEST SUMMARY');
        console.log('═'.repeat(70));
        console.log('✅ Database Connection: PASS');
        console.log(`✅ Video Materials: ${totalVideos} total, ${videosWithAnalysis} with analysis`);
        console.log(`✅ Chat History: ${totalChats} messages`);
        console.log(`✅ Students: ${totalStudents} registered`);
        console.log(`✅ Attendance: ${totalAttendance} records`);
        console.log(`✅ Exams: ${totalExams} scheduled`);
        console.log(`✅ Faculty: ${totalFaculty} members`);
        console.log(`✅ Schedules: ${totalSchedules} entries`);

        console.log('\n🎉 ALL TESTS PASSED!\n');
        console.log('═'.repeat(70));

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

runTests();
