const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Load .env if present

const connectDB = async () => {
  // Prefer environment MONGO_URI; fall back to IPv4 localhost to avoid IPv6 ::1 binding issues
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';
  const maxAttempts = Number(process.env.MONGO_CONNECT_ATTEMPTS || 5);
  const baseDelay = Number(process.env.MONGO_RETRY_DELAY_MS || 2000);

  // Helper to print a safe URI (hide credentials)
  const safeUri = (u) => u.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  // Basic URI diagnostics
  if (uri.includes('mongodb+srv://')) {
    console.log('📡 Detected MongoDB Atlas connection string');
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.error('❌ Invalid Atlas URI: Cannot use localhost/127.0.0.1 with mongodb+srv://');
      console.log('💡 Use a valid MongoDB Atlas cluster URL or switch to a local MongoDB URI');
      return false;
    }
  } else if (uri.startsWith('mongodb://')) {
    if (uri.includes('localhost')) {
      console.log('🏠 Detected local MongoDB connection (auto-correcting localhost to 127.0.0.1)');
    } else {
      console.log('🏠 Detected local MongoDB connection');
    }
  }

  console.log(`🔌 Will attempt to connect to MongoDB: ${safeUri(uri)} (up to ${maxAttempts} attempts)`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Prefer IPv4 for local connections to avoid driver attempting ::1 (IPv6)
      const preferIPv4 = uri.includes('127.0.0.1') || uri.includes('localhost');
      const connectOptions = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      };
      if (preferIPv4) {
        // Instruct the underlying driver to prefer IPv4
        connectOptions.family = 4;
      }

      const conn = await mongoose.connect(uri, connectOptions);
      console.log(`✅ MongoDB Connected: ${conn.connection.host} (attempt ${attempt})`);
      console.log(`📊 Database: ${conn.connection.name}`);
      return true;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}): ${error.message}`);
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 Local MongoDB likely not running. Start MongoDB or set MONGO_URI to a reachable server.');
        if (uri.includes('localhost') || uri.includes('::1')) {
          console.error('💡 Note: driver attempted IPv6 (::1). Try changing MONGO_URI to use 127.0.0.1 explicitly: mongodb://127.0.0.1:27017/yourdb');
        }
      } else if (error.message.includes('authentication failed')) {
        console.error('💡 Authentication failed. Check MONGO_URI credentials.');
        // Credentials are unlikely to change between retries — abort early
        break;
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('💡 Cannot resolve MongoDB host. Check network and MONGO_URI.');
      }

      if (attempt < maxAttempts) {
        const delay = baseDelay * attempt;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error('❌ All MongoDB connection attempts failed.');
  return false;
};


module.exports = connectDB;

