const mongoose = require('mongoose');
require('dotenv').config();
const Faculty = require('./models/Faculty');
const connectDB = require('./config/db');

const faculty = [
  {
    facultyId: "FAC001",
    name: "Dr. Elena Vance",
    email: "elena.vance@vignan.edu",
    department: "Computer Science",
    designation: "Head of Research",
    password: "password123",
    role: "faculty",
    qualification: "PhD in Quantum Systems",
    experience: "15+ Years",
    specialization: "Neural Networks & AI",
    assignments: [
      { year: "1", subject: "Quantum Computing", section: "A", branch: "CSE", semester: "1" },
      { year: "1", subject: "Digital Logic", section: "B", branch: "CSE", semester: "1" }
    ]
  },
  {
    facultyId: "FAC002",
    name: "Prof. Isaac Kleiner",
    email: "isaac.k@vignan.edu",
    department: "Information Technology",
    designation: "Professor Emeritus",
    password: "password123",
    role: "faculty",
    qualification: "D.Sc. in Applied Physics",
    experience: "25+ Years",
    specialization: "Distributed Architecture",
    assignments: [
      { year: "1", subject: "Data Structures", section: "A", branch: "CSE", semester: "1" },
      { year: "2", subject: "Algorithms", section: "A", branch: "CSE", semester: "3" }
    ]
  },
  {
    facultyId: "FAC003",
    name: "Dr. Gordon Freeman",
    email: "gordon.f@vignan.edu",
    department: "Electronics",
    designation: "Senior Scientist",
    password: "password123",
    role: "faculty",
    qualification: "PhD from MIT",
    experience: "12+ Years",
    specialization: "Cyber-Physical Systems",
    assignments: [
      { year: "1", subject: "Anomalous Materials", section: "A", branch: "CSE", semester: "1" }
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