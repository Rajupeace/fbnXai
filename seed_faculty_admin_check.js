#!/usr/bin/env node

/**
 * FACULTY DATA SEEDING & ADMIN SECTION VERIFICATION
 * Adds sample faculty to MongoDB and checks Admin Faculty section display
 */

const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/friendly_notebook';
const Faculty = require('./backend/models/Faculty');

const sampleFaculty = [
  {
    name: 'Dr. Rajesh Kumar',
    facultyId: 'FNB001',
    email: 'rajesh.kumar@fbn.edu',
    password: 'password123',
    designation: 'Professor',
    department: 'Computer Science',
    experience: '15+ Years',
    specialization: 'AI & Machine Learning',
    qualification: 'PhD in Computer Science',
    phone: '9876543210',
    assignments: [
      { year: '1', section: 'A', branch: 'CSE', subject: 'Data Structures', semester: '2' },
      { year: '2', section: 'B', branch: 'CSE', subject: 'Algorithms', semester: '4' }
    ]
  },
  {
    name: 'Prof. Ananya Singh',
    facultyId: 'FNB002',
    email: 'ananya.singh@fbn.edu',
    password: 'password123',
    designation: 'Associate Professor',
    department: 'Electronics',
    experience: '10+ Years',
    specialization: 'Digital Electronics',
    qualification: 'M.Tech',
    phone: '9876543211',
    assignments: [
      { year: '1', section: 'A', branch: 'ECE', subject: 'Digital Electronics', semester: '2' },
      { year: '2', section: 'A', branch: 'ECE', subject: 'Microprocessors', semester: '4' }
    ]
  },
  {
    name: 'Dr. Priya Patel',
    facultyId: 'FNB003',
    email: 'priya.patel@fbn.edu',
    password: 'password123',
    designation: 'Assistant Professor',
    department: 'Mathematics',
    experience: '8+ Years',
    specialization: 'Advanced Calculus',
    qualification: 'PhD in Mathematics',
    phone: '9876543212',
    assignments: [
      { year: '1', section: 'A', branch: 'CSE', subject: 'Mathematics-1', semester: '1' },
      { year: '1', section: 'B', branch: 'ECE', subject: 'Mathematics-1', semester: '1' }
    ]
  },
  {
    name: 'Rohit Verma',
    facultyId: 'FNB004',
    email: 'rohit.verma@fbn.edu',
    password: 'password123',
    designation: 'Lecturer',
    department: 'Physics',
    experience: '5+ Years',
    specialization: 'Quantum Physics',
    qualification: 'M.Sc',
    phone: '9876543213',
    assignments: [
      { year: '1', section: 'A', branch: 'All', subject: 'Physics', semester: '1' }
    ]
  },
  {
    name: 'Dr. Sneha Gupta',
    facultyId: 'FNB005',
    email: 'sneha.gupta@fbn.edu',
    password: 'password123',
    designation: 'Professor',
    department: 'Computer Science',
    experience: '20+ Years',
    specialization: 'Web Development',
    qualification: 'PhD',
    phone: '9876543214',
    assignments: [
      { year: '2', section: 'A', branch: 'CSE', subject: 'Web Technologies', semester: '3' },
      { year: '3', section: 'A', branch: 'CSE', subject: 'Advanced Web Apps', semester: '5' }
    ]
  }
];

async function seedFacultyData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');

    console.log('\n📚 STARTING FACULTY DATA SEEDING...\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const faculty of sampleFaculty) {
      try {
        const existing = await Faculty.findOne({ facultyId: faculty.facultyId });
        
        if (existing) {
          console.log(`⏭️  SKIPPED: ${faculty.facultyId} (${faculty.name}) - Already exists`);
          skippedCount++;
        } else {
          const newFaculty = await Faculty.create(faculty);
          console.log(`✅ ADDED: ${faculty.facultyId} (${faculty.name})`);
          console.log(`   - Email: ${faculty.email}`);
          console.log(`   - Department: ${faculty.department}`);
          console.log(`   - Teaching ${faculty.assignments.length} course(s)`);
          console.log('');
          addedCount++;
        }
      } catch (err) {
        console.error(`❌ ERROR adding ${faculty.facultyId}:`, err.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Faculty Added: ${addedCount}`);
    console.log(`⏭️  Faculty Skipped: ${skippedCount}`);
    console.log(`📚 Total Faculty in Database: ${await Faculty.countDocuments()}`);

    // Display all faculty for Admin verification
    console.log('\n' + '='.repeat(60));
    console.log('👥 ALL FACULTY IN DATABASE (FOR ADMIN SECTION)');
    console.log('='.repeat(60) + '\n');

    const allFaculty = await Faculty.find().select('-password -facultyToken').lean();
    
    if (allFaculty.length === 0) {
      console.log('❌ No faculty records found');
    } else {
      allFaculty.forEach((f, i) => {
        const uniqueSubjects = [...new Set((f.assignments || []).map(a => a.subject))];
        const totalStudents = (f.assignments || []).length * 50; // Estimate

        console.log(`[${i+1}] ${f.name} (${f.facultyId})`);
        console.log(`    📧 Email: ${f.email || 'N/A'}`);
        console.log(`    🏢 Department: ${f.department || 'General'}`);
        console.log(`    👔 Designation: ${f.designation || 'Lecturer'}`);
        console.log(`    📖 Experience: ${f.experience || 'N/A'}`);
        console.log(`    🎓 Qualification: ${f.qualification || 'N/A'}`);
        console.log(`    📱 Phone: ${f.phone || 'N/A'}`);
        console.log(`    📚 Teaching Courses: ${f.assignments?.length || 0}`);
        
        if (uniqueSubjects.length > 0) {
          console.log(`       Subjects: ${uniqueSubjects.join(', ')}`);
        }
        
        console.log(`    👨‍🎓 Est. Students: ${totalStudents}`);
        console.log('');
      });
    }

    console.log('='.repeat(60));
    console.log('✅ SEEDING COMPLETE - FACULTY DATA READY IN ADMIN SECTION');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    process.exit(1);
  }
}

seedFacultyData();
