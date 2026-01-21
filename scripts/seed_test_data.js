const mongoose = require('./backend/node_modules/mongoose');
const Student = require('./backend/models/Student');
const Attendance = require('./backend/models/Attendance');
const ExamResult = require('./backend/models/ExamResult');

async function seedTestData() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/friendly_notebook');
    console.log('Connected to MongoDB');

    // Create a test student
    const student = await Student.create({
      studentName: 'Test Student',
      sid: 'student001',
      email: 'test@example.com',
      year: 1,
      section: 'A',
      branch: 'CSE',
      password: 'password123'
    });
    console.log('Created student:', student);

    // Create some attendance data
    const attendance = await Attendance.create({
      subject: 'Data Structures',
      date: new Date(),
      facultyId: 'faculty001',
      section: 'A',
      branch: 'CSE',
      year: 1,
      records: [{
        studentId: 'student001',
        status: 'Present'
      }]
    });
    console.log('Created attendance:', attendance);

    // Create exam results
    const examResult = await ExamResult.create({
      studentId: 'student001',
      subject: 'Data Structures',
      examName: 'Midterm',
      score: 85,
      totalMarks: 100,
      date: new Date()
    });
    console.log('Created exam result:', examResult);

    console.log('Test data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedTestData();