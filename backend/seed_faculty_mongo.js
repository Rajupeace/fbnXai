const mongoose = require('mongoose');
require('dotenv').config();
const Faculty = require('./models/Faculty');
const connectDB = require('./config/db');

const faculty = [
  {
    facultyId: "faculty001",
    name: "Dr. Alice Wilson",
    email: "alice.wilson@example.com",
    department: "Computer Science",
    designation: "Assistant Professor",
    password: "password123",
    role: "faculty",
    assignments: [
      { year: 1, subject: "Data Structures", section: "A" },
      { year: 1, subject: "Programming", section: "B" }
    ]
  },
  {
    facultyId: "faculty002",
    name: "Prof. David Brown",
    email: "david.brown@example.com",
    department: "Computer Science",
    designation: "Professor",
    password: "password123",
    role: "faculty",
    assignments: [
      { year: 2, subject: "Algorithms", section: "A" }
    ]
  }
];

const seedFaculty = async () => {
  try {
    await connectDB();
    await Faculty.deleteMany(); // Clear existing
    await Faculty.insertMany(faculty);
    console.log('Faculty seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding faculty:', error);
    process.exit(1);
  }
};

seedFaculty();