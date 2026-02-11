#!/usr/bin/env node

/**
 * COMPREHENSIVE DATABASE SEEDING TOOL
 * Populates all collections with realistic sample data
 * Handles existing data and schema requirements
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    return true;
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    return false;
  }
}

async function seedComprehensiveData() {
  const db = mongoose.connection.db;
  
  try {
    // Seed Courses (for Admin Dashboard)
    console.log('📚 Seeding Courses...');
    const coursesCollection = db.collection('courses');
    const courseCount = await coursesCollection.countDocuments();
    
    if (courseCount === 0) {
      const courses = [
        {
          courseCode: 'CS101',
          courseName: 'Data Structures',
          year: 1,
          semester: 1,
          branch: 'CSE',
          credits: 4,
          faculty: 'Dr. Ramesh Kumar'
        },
        {
          courseCode: 'CS102',
          courseName: 'Web Development',
          year: 1,
          semester: 2,
          branch: 'CSE',
          credits: 3,
          faculty: 'Dr. Ramesh Kumar'
        },
        {
          courseCode: 'EC101',
          courseName: 'Digital Electronics',
          year: 1,
          semester: 1,
          branch: 'ECE',
          credits: 4,
          faculty: 'Prof. Seema Sharma'
        },
        {
          courseCode: 'CS201',
          courseName: 'Database Management',
          year: 2,
          semester: 3,
          branch: 'CSE',
          credits: 4,
          faculty: 'Dr. Ramesh Kumar'
        }
      ];
      await coursesCollection.insertMany(courses);
      console.log('   ✅ Inserted 4 courses\n');
    } else {
      console.log(`   ℹ️ ${courseCount} courses already exist\n`);
    }

    // Seed Materials
    console.log('📄 Seeding Materials...');
    const materialsCollection = db.collection('materials');
    const materialCount = await materialsCollection.countDocuments();
    
    if (materialCount === 0) {
      const materials = [
        {
          title: 'Data Structures Lecture Notes - Part 1',
          subject: 'Data Structures',
          course: 'CS101',
          description: 'Introduction to arrays, linked lists, and stacks',
          type: 'notes',
          year: 1,
          section: 'A',
          branch: 'CSE',
          fileName: 'DS_Lecture1.pdf',
          uploadedAt: new Date('2026-01-15'),
          uploadedBy: 'Dr. Ramesh Kumar',
          fileSize: '2.5 MB'
        },
        {
          title: 'Web Development Tutorial Videos',
          subject: 'Web Development',
          course: 'CS102',
          description: 'HTML, CSS, JavaScript basics',
          type: 'videos',
          year: 1,
          section: 'A',
          branch: 'CSE',
          fileName: 'WebDev_Tutorial.zip',
          uploadedAt: new Date('2026-01-16'),
          uploadedBy: 'Dr. Ramesh Kumar',
          fileSize: '150 MB'
        },
        {
          title: 'Digital Electronics Circuit Diagrams',
          subject: 'Digital Electronics',
          course: 'EC101',
          description: 'Logic gates and circuit implementations',
          type: 'documents',
          year: 1,
          section: 'A',
          branch: 'ECE',
          fileName: 'DigitalCircuits.pdf',
          uploadedAt: new Date('2026-01-17'),
          uploadedBy: 'Prof. Seema Sharma',
          fileSize: '5.8 MB'
        }
      ];
      await materialsCollection.insertMany(materials);
      console.log('   ✅ Inserted 3 materials\n');
    } else {
      console.log(`   ℹ️ ${materialCount} materials already exist\n`);
    }

    // Seed Messages
    console.log('💬 Seeding Messages...');
    const messagesCollection = db.collection('messages');
    const messageCount = await messagesCollection.countDocuments();
    
    if (messageCount === 0) {
      const messages = [
        {
          title: 'System Announcement',
          content: 'Welcome to FBN XAI Learning Management System. All dashboards are now active.',
          sender: 'Admin',
          senderType: 'admin',
          timestamp: new Date('2026-01-10'),
          isGlobal: true,
          priority: 'High',
          read: false
        },
        {
          title: 'Class Schedule Update',
          content: 'Data Structures class has been moved to Room 102. Lab sessions remain in Lab 5.',
          sender: 'Dr. Ramesh Kumar',
          senderType: 'faculty',
          timestamp: new Date('2026-01-18'),
          isGlobal: false,
          priority: 'Medium',
          read: false
        },
        {
          title: 'Assignment Submission',
          content: 'New assignment uploaded for Web Development course. Deadline: Jan 25, 2026',
          sender: 'Dr. Ramesh Kumar',
          senderType: 'faculty',
          timestamp: new Date('2026-01-18'),
          isGlobal: false,
          priority: 'High',
          read: false
        }
      ];
      await messagesCollection.insertMany(messages);
      console.log('   ✅ Inserted 3 messages\n');
    } else {
      console.log(`   ℹ️ ${messageCount} messages already exist\n`);
    }

    // Seed Schedule
    console.log('⏰ Seeding Schedule...');
    const scheduleCollection = db.collection('schedules');
    const scheduleCount = await scheduleCollection.countDocuments();
    
    if (scheduleCount === 0) {
      const schedule = [
        {
          day: 'Monday',
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          subject: 'Data Structures',
          faculty: 'Dr. Ramesh Kumar',
          room: '101',
          type: 'Theory',
          year: 1,
          section: 'A',
          branch: 'CSE',
          building: 'Main Building'
        },
        {
          day: 'Tuesday',
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          subject: 'Web Development',
          faculty: 'Dr. Ramesh Kumar',
          room: 'Lab-5',
          type: 'Lab',
          year: 1,
          section: 'A',
          branch: 'CSE',
          building: 'Lab Building'
        },
        {
          day: 'Wednesday',
          startTime: '02:00 PM',
          endTime: '03:30 PM',
          subject: 'Digital Electronics',
          faculty: 'Prof. Seema Sharma',
          room: '201',
          type: 'Theory',
          year: 1,
          section: 'A',
          branch: 'ECE',
          building: 'Main Building'
        },
        {
          day: 'Thursday',
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          subject: 'Digital Electronics',
          faculty: 'Prof. Seema Sharma',
          room: 'Lab-3',
          type: 'Lab',
          year: 1,
          section: 'A',
          branch: 'ECE',
          building: 'Lab Building'
        },
        {
          day: 'Friday',
          startTime: '11:00 AM',
          endTime: '12:30 PM',
          subject: 'Data Structures',
          faculty: 'Dr. Ramesh Kumar',
          room: '101',
          type: 'Tutorial',
          year: 1,
          section: 'A',
          branch: 'CSE',
          building: 'Main Building'
        }
      ];
      await scheduleCollection.insertMany(schedule);
      console.log('   ✅ Inserted 5 schedule entries\n');
    } else {
      console.log(`   ℹ️ ${scheduleCount} schedule entries already exist\n`);
    }

    // Seed Attendances
    console.log('📊 Seeding Attendances...');
    const attendanceCollection = db.collection('attendances');
    const attendanceCount = await attendanceCollection.countDocuments();
    
    if (attendanceCount === 0) {
      const attendance = [
        {
          studentId: 'STU001',
          studentName: 'Rajesh Kumar',
          subject: 'Data Structures',
          course: 'CS101',
          date: new Date('2026-01-20'),
          status: 'Present',
          semester: 1,
          year: 1
        },
        {
          studentId: 'STU002',
          studentName: 'Priya Singh',
          subject: 'Data Structures',
          course: 'CS101',
          date: new Date('2026-01-20'),
          status: 'Present',
          semester: 1,
          year: 1
        },
        {
          studentId: 'STU003',
          studentName: 'Amit Patel',
          subject: 'Data Structures',
          course: 'CS101',
          date: new Date('2026-01-20'),
          status: 'Absent',
          semester: 1,
          year: 1
        },
        {
          studentId: 'STU001',
          studentName: 'Rajesh Kumar',
          subject: 'Web Development',
          course: 'CS102',
          date: new Date('2026-01-21'),
          status: 'Present',
          semester: 2,
          year: 1
        },
        {
          studentId: 'STU002',
          studentName: 'Priya Singh',
          subject: 'Web Development',
          course: 'CS102',
          date: new Date('2026-01-21'),
          status: 'Absent',
          semester: 2,
          year: 1
        }
      ];
      await attendanceCollection.insertMany(attendance);
      console.log('   ✅ Inserted 5 attendance records\n');
    } else {
      console.log(`   ℹ️ ${attendanceCount} attendance records already exist\n`);
    }

    // Seed Exams
    console.log('✍️ Seeding Exams...');
    const examsCollection = db.collection('exams');
    const examCount = await examsCollection.countDocuments();
    
    if (examCount === 0) {
      const exams = [
        {
          examName: 'Data Structures Mid Term',
          subject: 'Data Structures',
          course: 'CS101',
          examDate: new Date('2026-02-15'),
          startTime: '10:00 AM',
          endTime: '12:00 PM',
          duration: 120,
          totalMarks: 100,
          location: 'Exam Hall 1',
          year: 1,
          section: 'A',
          branch: 'CSE'
        },
        {
          examName: 'Web Development Quiz 1',
          subject: 'Web Development',
          course: 'CS102',
          examDate: new Date('2026-01-28'),
          startTime: '02:00 PM',
          endTime: '02:30 PM',
          duration: 30,
          totalMarks: 20,
          location: 'Classroom 101',
          year: 1,
          section: 'A',
          branch: 'CSE'
        },
        {
          examName: 'Digital Electronics Lab Exam',
          subject: 'Digital Electronics',
          course: 'EC101',
          examDate: new Date('2026-02-10'),
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          duration: 120,
          totalMarks: 50,
          location: 'Lab 3',
          year: 1,
          section: 'A',
          branch: 'ECE'
        }
      ];
      await examsCollection.insertMany(exams);
      console.log('   ✅ Inserted 3 exams\n');
    } else {
      console.log(`   ℹ️ ${examCount} exams already exist\n`);
    }

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

async function displaySummary() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║         DATABASE SEEDING SUMMARY                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const db = mongoose.connection.db;
  const collections = [
    'students',
    'faculties',
    'courses',
    'materials',
    'messages',
    'schedules',
    'attendances',
    'exams'
  ];

  let totalDocuments = 0;

  console.log('📋 COLLECTION STATUS:\n');
  for (const collName of collections) {
    try {
      const coll = db.collection(collName);
      const count = await coll.countDocuments();
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${collName.padEnd(20)} : ${count.toString().padStart(3)} documents`);
      totalDocuments += count;
    } catch (error) {
      console.log(`❌ ${collName.padEnd(20)} : Error`);
    }
  }

  console.log(`\n📊 TOTAL DOCUMENTS: ${totalDocuments}\n`);
  console.log('✅ DATABASE READY FOR DASHBOARDS\n');
  console.log('🚀 NEXT STEPS:');
  console.log('   1. Restart backend server: npm start');
  console.log('   2. Start frontend: npm start');
  console.log('   3. Login to dashboards');
  console.log('   4. Data will appear automatically in all sections\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   COMPREHENSIVE DATABASE SEEDING TOOL                  ║');
  console.log('║   Populating all collections with sample data          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  try {
    await seedComprehensiveData();
    await displaySummary();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
