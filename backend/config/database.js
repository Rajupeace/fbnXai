// Enhanced Database Connection with Error Handling and Retry Logic
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Load .env if present

const connectDB = async () => {
    // Enhanced connection options for better reliability
    const connectionOptions = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        // Connection pool sizing for better performance
        maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 50),
        minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
        // Retry writes on network errors
        retryWrites: true,
        // Buffering for better performance
        bufferCommands: true,
        // Heartbeat settings
        heartbeatFrequencyMS: 10000
    };

    // Multiple connection string options with fallbacks
    const connectionStrings = [
        process.env.MONGO_URI,
        process.env.MONGODB_URI,
        process.env.MONGO_URL,
        'mongodb://127.0.0.1:27017/fbn_xai_system',
        'mongodb://localhost:27017/fbn_xai_system',
        'mongodb://0.0.0.0:27017/fbn_xai_system'
    ].filter(Boolean);

    // Try each connection string until one works
    for (let i = 0; i < connectionStrings.length; i++) {
        const uri = connectionStrings[i];
        
        console.log(`🔌 Attempting connection ${i + 1}/${connectionStrings.length}: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
        
        try {
            // Test connection string validity
            if (uri.includes('mongodb+srv://')) {
                if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
                    console.error('❌ Invalid Atlas URI: Cannot use localhost/127.0.0.1 with mongodb+srv://');
                    continue;
                }
            }
            
            // Connect with enhanced options
            const conn = await mongoose.connect(uri, connectionOptions);
            
            console.log(`✅ MongoDB Connected Successfully!`);
            console.log(`📊 Database: ${conn.connection.name}`);
            console.log(`🌐 Host: ${conn.connection.host}`);
            console.log(`🔌 Port: ${conn.connection.port}`);
            
            // Set up connection event listeners
            mongoose.connection.on('connected', () => {
                console.log('🔗 MongoDB connection established');
            });
            
            mongoose.connection.on('error', (err) => {
                console.error('❌ MongoDB connection error:', err.message);
            });
            
            mongoose.connection.on('disconnected', () => {
                console.log('🔌 MongoDB disconnected');
            });
            
            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ Connection ${i + 1} failed: ${error.message}`);
            
            // Provide specific error guidance
            if (error.message.includes('ECONNREFUSED')) {
                console.error('💡 MongoDB server not running. Start MongoDB service or check connection string.');
                console.error('💡 Install MongoDB: https://www.mongodb.com/try/download/community');
                console.error('💡 Start MongoDB: mongod --dbpath /data/db');
                console.error('💡 Default port: 27017');
            } else if (error.message.includes('authentication failed')) {
                console.error('💡 Authentication failed. Check credentials in MONGO_URI.');
                console.error('💡 Ensure username/password are correct in connection string.');
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                console.error('💡 Cannot resolve MongoDB host. Check network and DNS settings.');
                console.error('💡 Check if MongoDB is running on specified host and port.');
            } else if (error.message.includes('timeout')) {
                console.error('💡 Connection timeout. Increase timeout or check network latency.');
            } else if (error.message.includes('invalid')) {
                console.error('💡 Invalid connection string format. Check URI format.');
            }
            
            // Continue to next connection string
            continue;
        }
    }
    
    console.error('❌ All MongoDB connection attempts failed.');
    console.error('💡 Please check:');
    console.error('   1. MongoDB service is running');
    console.error('   2. Connection string is correct');
    console.error('   3. Network connectivity is stable');
    console.error('   4. Firewall allows MongoDB port (default: 27017)');
    console.error('   5. MongoDB credentials are valid');
    
    return false;
};

// Enhanced connection with monitoring
const connectDBWithMonitoring = async () => {
    const connected = await connectDB();
    
    if (connected) {
        console.log('🎯 Database connection monitoring active');
        
        // Periodic connection health check
        setInterval(() => {
            if (mongoose.connection.readyState === 1) {
                console.log('✅ MongoDB connection healthy');
            } else {
                console.log('⚠️ MongoDB connection lost, attempting reconnection...');
            }
        }, 30000); // Check every 30 seconds
    }
    
    return connected;
};

// Graceful shutdown
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('🔌 MongoDB disconnected gracefully');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
};

module.exports = {
    connectDB,
    connectDBWithMonitoring,
    disconnectDB,
    mongoose
};
