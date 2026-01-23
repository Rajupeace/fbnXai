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
      Material.deleteMany({}).catch(() => { }),
      Message.deleteMany({}).catch(() => { }),
      Attendance.deleteMany({}).catch(() => { }),
      mongoose.connection.collection('studentFaculty')?.deleteMany({}).catch(() => { })
    ]);

    console.log('Inserting demo admin...');
    await Admin.create({ adminId: 'BobbyFNB@09=', password: 'Martin@FNB09', name: 'Administrator' });

    console.log('Inserting demo faculty...');
    await Faculty.insertMany([
      {
        facultyId: 'FAC001',
        name: 'Dr. Elena Vance',
        email: 'elena.vance@vignan.edu',
        password: 'password123',
        department: 'Computer Science',
        designation: 'Head of Research',
        qualification: 'PhD in Quantum Systems',
        experience: '15+ Years',
        specialization: 'Neural Networks & AI',
        assignments: [
          { year: '1', subject: 'Quantum Computing', section: 'A', branch: 'CSE', semester: '1' },
          { year: '1', subject: 'Digital Logic', section: 'A', branch: 'CSE', semester: '1' }
        ]
      },
      {
        facultyId: 'FAC002',
        name: 'Prof. Isaac Kleiner',
        email: 'isaac.k@vignan.edu',
        password: 'password123',
        department: 'Information Technology',
        designation: 'Professor Emeritus',
        qualification: 'D.Sc. in Applied Physics',
        experience: '25+ Years',
        specialization: 'Distributed Architecture',
        assignments: [
          { year: '1', subject: 'Data Structures', section: 'A', branch: 'CSE', semester: '1' },
          { year: '1', subject: 'Numerical Methods', section: 'A', branch: 'CSE', semester: '1' }
        ]
      },
      {
        facultyId: 'FAC003',
        name: 'Dr. Gordon Freeman',
        email: 'gordon.f@vignan.edu',
        password: 'password123',
        department: 'Electronics',
        designation: 'Senior Scientist',
        qualification: 'PhD from MIT',
        experience: '12+ Years',
        specialization: 'Cyber-Physical Systems',
        assignments: [
          { year: '1', subject: 'Anomalous Materials', section: 'A', branch: 'CSE', semester: '1' }
        ]
      }
    ]);

    console.log('Inserting demo students...');
    await Student.insertMany([
      {
        sid: 'S001',
        studentName: 'John Doe',
        email: 'john.doe@example.edu',
        password: 'password123',
        branch: 'CSE',
        year: '1',
        section: 'A',
        stats: { streak: 15, aiUsageCount: 42, advancedProgress: 85, cgpa: 9.2 }
      },
      {
        sid: 'S002',
        studentName: 'Jane Roe',
        email: 'jane.roe@example.edu',
        password: 'password123',
        branch: 'CSE',
        year: '1',
        section: 'A',
        stats: { streak: 8, aiUsageCount: 12, advancedProgress: 45, cgpa: 8.8 }
      }
    ]);


    console.log('Seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

run();
