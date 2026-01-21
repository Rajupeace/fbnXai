const mongoose = require('mongoose');
require('dotenv').config();
const Message = require('./models/Message');
const connectDB = require('./config/db');

const messages = [
  {
    id: "msg001",
    message: "Welcome to the new academic year!",
    target: "all",
    sender: "admin",
    date: new Date()
  },
  {
    id: "msg002",
    message: "Data Structures assignment due next week",
    target: "students",
    sender: "faculty001",
    date: new Date()
  }
];

const seedMessages = async () => {
  try {
    await connectDB();
    await Message.deleteMany(); // Clear existing
    await Message.insertMany(messages);
    console.log('Messages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding messages:', error);
    process.exit(1);
  }
};

seedMessages();