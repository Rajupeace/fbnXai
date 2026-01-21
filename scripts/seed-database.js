#!/usr/bin/env node

/**
 * DATABASE DATA SEEDING & VERIFICATION
 * Populates MongoDB with sample data for all dashboards
 * Ensures data flows to frontend properly
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

const MONGO_URI = 'mongodb://127.0.0.1:27017/friendly_notebook';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    return false;
  }
}

async function seedData() {
  console.log('📊 SEEDING DATABASE WITH SAMPLE DATA\n');
  
  const db = mongoose.connection.db;
  
  try {
    // 1. Students Collection
    console.log('1️⃣ Seeding Students...');
    const studentsCollection = db.collection('students');
    const existingStudents = await studentsCollection.countDocuments();
    
    if (existingStudents === 0) {
      const students = [
        {
          studentName: 'Rajesh Kumar',
          sid: 'STU001',
          email: 'rajesh@college.edu',
          year: 1,
          section: 'A',
          branch: 'CSE',
          joinDate: new Date('2024-01-15')
        },
        {
          studentName: 'Priya Singh',
          sid: 'STU002',
          email: 'priya@college.edu',
          year: 1,
          section: 'A',
          branch: 'CSE',
          joinDate: new Date('2024-01-15')
        },
        {
          studentName: 'Amit Patel',
          sid: 'STU003',
          email: 'amit@college.edu',
          year: 2,
          section: 'B',
          branch: 'ECE',
          joinDate: new Date('2023-01-15')
        }
      ];
      await studentsCollection.insertMany(students);
      console.log('   ✅ Inserted 3 students\n');
    } else {
      console.log(`   ⚠️ ${existingStudents} students already exist\n`);
    }

    // 2. Faculty Collection
    console.log('2️⃣ Seeding Faculty...');
    const facultyCollection = db.collection('faculties');
    const existingFaculty = await facultyCollection.countDocuments();
    
    if (existingFaculty === 0) {
      const faculty = [
        {
          facultyName: 'Dr. Ramesh Kumar',
          fid: 'FAC001',
          email: 'ramesh@college.edu',
          department: 'Computer Science',
          phone: '9876543210'
        },
        {
          facultyName: 'Prof. Seema Sharma',
          fid: 'FAC002',
          email: 'seema@college.edu',
          department: 'Electronics',
          phone: '9876543211'
        }
      ];
      await facultyCollection.insertMany(faculty);
      console.log('   ✅ Inserted 2 faculty members\n');
    } else {
      console.log(`   ⚠️ ${existingFaculty} faculty already exist\n`);
    }

    // 3. Courses Collection
    console.log('3️⃣ Seeding Courses...');
    const coursesCollection = db.collection('courses');
    const existingCourses = await coursesCollection.countDocuments();
    
    if (existingCourses === 0) {
      const courses = [
        {
          name: 'Data Structures',
          code: 'CS101',
          year: 1,
          semester: 1,
          branch: 'CSE',
          credits: 4
        },
        {
          name: 'Web Development',
          code: 'CS102',
          year: 1,
          semester: 2,
          branch: 'CSE',
          credits: 3
        },
        {
          name: 'Digital Electronics',
          code: 'EC101',
          year: 1,
          semester: 1,
          branch: 'ECE',
          credits: 4
        }
      ];
      await coursesCollection.insertMany(courses);
      console.log('   ✅ Inserted 3 courses\n');
    } else {
      console.log(`   ⚠️ ${existingCourses} courses already exist\n`);
    }

    // 4. Materials Collection
    console.log('4️⃣ Seeding Materials...');
    const materialsCollection = db.collection('materials');
    const existingMaterials = await materialsCollection.countDocuments();
    
    if (existingMaterials === 0) {
      const materials = [
        {
          title: 'Data Structures Lecture Notes',
          subject: 'Data Structures',
          type: 'notes',
          year: 1,
          section: 'A',
          branch: 'CSE',
          uploadedAt: new Date(),
          uploadedBy: 'Dr. Ramesh Kumar'
        },
        {
          title: 'Web Development Tutorial',
          subject: 'Web Development',
          type: 'videos',
          year: 1,
          section: 'A',
          branch: 'CSE',
          uploadedAt: new Date(),
          uploadedBy: 'Dr. Ramesh Kumar'
        }
      ];
      await materialsCollection.insertMany(materials);
      console.log('   ✅ Inserted 2 materials\n');
    } else {
      console.log(`   ⚠️ ${existingMaterials} materials already exist\n`);
    }

    // 5. Messages Collection
    console.log('5️⃣ Seeding Messages...');
    const messagesCollection = db.collection('messages');
    const existingMessages = await messagesCollection.countDocuments();
    
    if (existingMessages === 0) {
      const messages = [
        {
          title: 'Welcome to the System',
          content: 'Welcome to FBN XAI Learning Management System',
          sender: 'Admin',
          timestamp: new Date(),
          isGlobal: true
        },
        {
          title: 'Class Announcement',
          content: 'Data Structures class moved to Room 102',
          sender: 'Dr. Ramesh Kumar',
          timestamp: new Date(),
          isGlobal: false
        }
      ];
      await messagesCollection.insertMany(messages);
      console.log('   ✅ Inserted 2 messages\n');
    } else {
      console.log(`   ⚠️ ${existingMessages} messages already exist\n`);
    }

    // 6. Schedule Collection
    console.log('6️⃣ Seeding Schedule...');
    const scheduleCollection = db.collection('schedule');
    const existingSchedule = await scheduleCollection.countDocuments();
    
    if (existingSchedule === 0) {
      const schedule = [
        {
          day: 'Monday',
          time: '09:00 AM',
          subject: 'Data Structures',
          faculty: 'Dr. Ramesh Kumar',
          room: '101',
          type: 'Theory',
          year: 1,
          section: 'A',
          branch: 'CSE'
        },
        {
          day: 'Tuesday',
          time: '10:00 AM',
          subject: 'Web Development',
          faculty: 'Dr. Ramesh Kumar',
          room: '102',
          type: 'Lab',
          year: 1,
          section: 'A',
          branch: 'CSE'
        }
      ];
      await scheduleCollection.insertMany(schedule);
      console.log('   ✅ Inserted 2 schedule entries\n');
    } else {
      console.log(`   ⚠️ ${existingSchedule} schedule entries already exist\n`);
    }

    // 7. Attendance Collection
    console.log('7️⃣ Seeding Attendance...');
    const attendanceCollection = db.collection('attendances');
    const existingAttendance = await attendanceCollection.countDocuments();
    
    if (existingAttendance === 0) {
      const attendance = [
        {
          studentId: 'STU001',
          studentName: 'Rajesh Kumar',
          subject: 'Data Structures',
          date: new Date('2026-01-20'),
          status: 'Present'
        },
        {
          studentId: 'STU002',
          studentName: 'Priya Singh',
          subject: 'Data Structures',
          date: new Date('2026-01-20'),
          status: 'Present'
        }
      ];
      await attendanceCollection.insertMany(attendance);
      console.log('   ✅ Inserted 2 attendance records\n');
    } else {
      console.log(`   ⚠️ ${existingAttendance} attendance records already exist\n`);
    }

    // 8. Todos Collection
    console.log('8️⃣ Seeding Todos...');
    const todosCollection = db.collection('todos');
    const existingTodos = await todosCollection.countDocuments();
    
    if (existingTodos === 0) {
      const todos = [
        {
          title: 'Complete Data Structures Assignment',
          description: 'Implement Binary Search Tree',
          dueDate: new Date('2026-01-25'),
          priority: 'High',
          status: 'Pending'
        },
        {
          title: 'Review Web Development Tutorial',
          description: 'Watch all 5 parts',
          dueDate: new Date('2026-01-27'),
          priority: 'Medium',
          status: 'In Progress'
        }
      ];
      await todosCollection.insertMany(todos);
      console.log('   ✅ Inserted 2 todos\n');
    } else {
      console.log(`   ⚠️ ${existingTodos} todos already exist\n`);
    }

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
}

async function verifyData() {
  console.log('\n📋 DATABASE VERIFICATION\n');
  
  const db = mongoose.connection.db;
  const collections = [
    'students',
    'faculties',
    'courses',
    'materials',
    'messages',
    'schedule',
    'attendances',
    'todos'
  ];

  let totalDocuments = 0;

  for (const collName of collections) {
    try {
      const coll = db.collection(collName);
      const count = await coll.countDocuments();
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${collName.padEnd(20)} : ${count} documents`);
      totalDocuments += count;
    } catch (error) {
      console.log(`❌ ${collName.padEnd(20)} : Error`);
    }
  }

  console.log(`\n📊 Total Documents: ${totalDocuments}`);
  console.log(`✅ Database is ${totalDocuments > 0 ? 'READY' : 'EMPTY'}\n`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   DATABASE SEEDING & VERIFICATION TOOL                 ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  try {
    await seedData();
    await verifyData();
    
    console.log('🎉 SEEDING COMPLETE!\n');
    console.log('✅ Data is now ready to display in dashboards');
    console.log('✅ Restart the application to see changes');
    console.log('✅ All sections and cards will show data automatically\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
