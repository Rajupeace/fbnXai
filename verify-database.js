// Verify Database Logging
const mongoose = require('./backend/node_modules/mongoose');
const ChatModel = require('./backend/models/Chat');

async function verifyDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb+srv://rajupeace:Rajupeace%402007@cluster0.urx87b3.mongodb.net/fbn_xai_system?appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('\n✅ Connected to MongoDB');
        
        // Check latest chat records
        const latestChats = await ChatModel.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .lean();
        
        console.log(`\n📊 Database Verification - Last 10 Chat Records:\n`);
        
        if (latestChats.length === 0) {
            console.log('⚠️  No chat records found in database yet');
        } else {
            latestChats.forEach((chat, index) => {
                console.log(`${index + 1}. Role: ${chat.role} | User: ${chat.userId}`);
                console.log(`   Message: "${chat.userMessage?.substring(0, 40)}..."`);
                console.log(`   Response: "${chat.agentResponse?.substring(0, 40)}..."`);
                console.log(`   Time: ${new Date(chat.timestamp).toLocaleString()}\n`);
            });
        }
        
        // Get statistics
        const totalChats = await ChatModel.countDocuments();
        const studentChats = await ChatModel.countDocuments({ role: 'student' });
        const facultyChats = await ChatModel.countDocuments({ role: 'faculty' });
        const adminChats = await ChatModel.countDocuments({ role: 'admin' });
        
        console.log('═'.repeat(60));
        console.log('📈 Database Statistics:');
        console.log(`   Total Records: ${totalChats}`);
        console.log(`   Student Chats: ${studentChats}`);
        console.log(`   Faculty Chats: ${facultyChats}`);
        console.log(`   Admin Chats: ${adminChats}`);
        console.log('═'.repeat(60) + '\n');
        
        if (totalChats > 0) {
            console.log('✅ Database logging is WORKING PROPERLY! Responses are being stored.\n');
        }
        
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database verification failed:', error.message);
        process.exit(1);
    }
}

verifyDatabase();
