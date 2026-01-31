// Enhanced Database Connection Test Script
const { connectDB, connectDBWithMonitoring, disconnectDB } = require('./config/database');

async function testDatabaseConnection() {
    console.log('🔍 Testing Database Connection...\n');
    
    try {
        // Test basic connection
        console.log('1. Testing basic connection...');
        const connected = await connectDB();
        
        if (connected) {
            console.log('✅ Database connection successful!\n');
            
            // Test connection with monitoring
            console.log('2. Testing connection with monitoring...');
            const monitored = await connectDBWithMonitoring();
            
            if (monitored) {
                console.log('✅ Connection with monitoring active!\n');
                
                // Test database operations
                console.log('3. Testing database operations...');
                const mongoose = require('mongoose');
                
                // Test basic operations
                try {
                    // Get database info
                    const db = mongoose.connection.db;
                    const admin = db.admin();
                    const result = await admin.ping();
                    console.log('✅ Database ping successful:', result);
                    
                    // List collections
                    const collections = await db.listCollections().toArray();
                    console.log(`✅ Found ${collections.length} collections`);
                    collections.forEach(col => console.log(`   - ${col.name}`));
                    
                    console.log('\n🎯 Database connection test completed successfully!');
                    
                } catch (opError) {
                    console.error('❌ Database operations test failed:', opError.message);
                }
                
                // Keep connection alive for a few seconds to test monitoring
                console.log('\n⏳ Testing connection monitoring for 10 seconds...');
                await new Promise(resolve => setTimeout(resolve, 10000));
                
                // Test graceful disconnect
                console.log('\n4. Testing graceful disconnect...');
                await disconnectDB();
                console.log('✅ Graceful disconnect successful!');
                
            } else {
                console.error('❌ Connection with monitoring failed');
            }
        } else {
            console.error('❌ Basic database connection failed');
        }
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testDatabaseConnection().then(() => {
    console.log('\n🏁 Database test completed');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Database test crashed:', error);
    process.exit(1);
});
