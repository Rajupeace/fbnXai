const mongoose = require('mongoose');
const connectDB = require('./config/db');

async function test() {
  try {
    const useMongoDB = await connectDB();
    console.log('useMongoDB:', useMongoDB);
    if (useMongoDB) {
      const Course = require('./models/Course');
      const courses = await Course.find();
      console.log('Courses:', courses);
    } else {
      console.log('Using file-based');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

test();