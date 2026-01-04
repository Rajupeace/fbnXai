const mongoose = require('mongoose');
const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Explicit path

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

    console.log('🔌 Attempting MongoDB connection...');

    // Validate MongoDB Atlas URI format
    if (uri.includes('mongodb+srv://')) {
      console.log('📡 Detected MongoDB Atlas connection string');

      // Check for common Atlas URI issues
      if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
        console.error('❌ Invalid Atlas URI: Cannot use localhost/127.0.0.1 with mongodb+srv://');
        console.log('💡 Please use a valid MongoDB Atlas cluster URL or switch to local MongoDB');
        return false;
      }

      // Ensure password is URL encoded
      if (!uri.includes('@cluster') && !uri.includes('@mongodb')) {
        console.warn('⚠️  Atlas URI might be malformed. Ensure format: mongodb+srv://username:password@cluster.mongodb.net/database');
      }
    } else if (uri.startsWith('mongodb://')) {
      console.log('🏠 Detected local MongoDB connection');

      // Force 127.0.0.1 if localhost is used (Node 17+ fix)
      if (uri.includes('localhost')) {
        uri = uri.replace('localhost', '127.0.0.1');
        console.log('🔧 Auto-corrected localhost to 127.0.0.1');
      }
    }

    console.log(`🔌 Connecting to: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Hide credentials in logs

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds for Atlas
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Local MongoDB is not running. Start MongoDB or use MongoDB Atlas.');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Authentication failed. Check your username and password in MONGO_URI.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 Cannot resolve MongoDB host. Check your MONGO_URI or internet connection.');
    }

    return false;
  }
};


module.exports = connectDB;

