const connectDB = require('../config/db');
const mongoose = require('mongoose');

async function run() {
  const ok = await connectDB();
  if (!ok) {
    console.error('MongoDB connection failed. Aborting seed.');
    process.exit(1);
  }

  try {
    const Admin = require('../models/Admin');
    const Faculty = require('../models/Faculty');
    const Student = require('../models/Student');
    const Material = require('../models/Material');
    const Message = require('../models/Message');
    const Attendance = require('../models/Attendance');

    console.log('Clearing existing collections...');
    await Promise.all([
      Admin.deleteMany({}),
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Material.deleteMany({}).catch(() => {}),
      Message.deleteMany({}).catch(() => {}),
      Attendance.deleteMany({}).catch(() => {}),
      mongoose.connection.collection('studentFaculty')?.deleteMany({}).catch(() => {})
    ]);

    console.log('Inserting demo admin...');
    await Admin.create({ adminId: 'admin', password: 'admin123', name: 'Administrator' });

    console.log('Inserting demo faculty...');
    await Faculty.insertMany([
      {
        facultyId: 'F001',
        name: 'Dr. Sarah Smith',
        email: 'sarah.smith@example.edu',
        password: 'password',
        department: 'Computer Science',
        designation: 'Professor',
        assignments: [
          { year: '1', subject: 'Mathematics I', section: 'A', branch: 'CSE' },
          { year: '1', subject: 'Programming 1', section: 'A', branch: 'CSE' }
        ]
      },
      {
        facultyId: 'F002',
        name: 'Prof. Michael Johnson',
        email: 'michael.j@example.edu',
        password: 'password',
        department: 'Computer Science',
        designation: 'Lecturer',
        assignments: [
          { year: '1', subject: 'Data Structures', section: 'B', branch: 'CSE' }
        ]
      }
    ]);

    console.log('Inserting demo students...');
    await Student.insertMany([
      { sid: 'S001', studentName: 'John Doe', email: 'john.doe@example.edu', password: 'student123', branch: 'CSE', year: '1', section: 'A' },
      { sid: 'S002', studentName: 'Jane Roe', email: 'jane.roe@example.edu', password: 'student123', branch: 'CSE', year: '1', section: 'B' }
    ]);

    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run();
