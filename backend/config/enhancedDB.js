const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Enhanced MongoDB connection with Atlas support
const connectDB = async () => {
  // Enhanced URI handling for both local and Atlas
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vuai_knowledge_system';
  const maxAttempts = Number(process.env.MONGO_CONNECT_ATTEMPTS || 5);
  const baseDelay = Number(process.env.MONGO_RETRY_DELAY_MS || 2000);

  // Helper to print a safe URI (hide credentials)
  const safeUri = (u) => u.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  console.log('🔗 Enhanced MongoDB Connection System');
  console.log('=====================================');

  // Enhanced URI diagnostics
  if (uri.includes('mongodb+srv://')) {
    console.log('☁️  Detected MongoDB Atlas connection string');
    if (uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.error('❌ Invalid Atlas URI: Cannot use localhost/127.0.0.1 with mongodb+srv://');
      console.log('💡 Use a valid MongoDB Atlas cluster URL');
      console.log('💡 Example: mongodb+srv://username:password@cluster.mongodb.net/dbname');
      return false;
    }
    
    // Atlas-specific configuration
    console.log('🌐 Configuring for MongoDB Atlas...');
    const atlasOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      },
      retryWrites: true,
      w: 'majority'
    };
    
    return await connectWithRetry(uri, atlasOptions, maxAttempts, baseDelay, safeUri);
    
  } else if (uri.startsWith('mongodb://')) {
    if (uri.includes('localhost')) {
      console.log('🏠 Detected local MongoDB connection (auto-correcting to 127.0.0.1)');
    } else {
      console.log('🏠 Detected local MongoDB connection');
    }
    
    // Local MongoDB configuration
    const localOptions = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 0,
      family: 4 // Force IPv4 for local connections
    };
    
    return await connectWithRetry(uri, localOptions, maxAttempts, baseDelay, safeUri);
  }

  console.error('❌ Invalid MongoDB URI format');
  return false;
};

// Enhanced connection retry logic
const connectWithRetry = async (uri, options, maxAttempts, baseDelay, safeUri) => {
  console.log(`🔌 Will attempt to connect to MongoDB: ${safeUri(uri)} (up to ${maxAttempts} attempts)`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${maxAttempts}...`);
      
      const conn = await mongoose.connect(uri, options);
      console.log(`✅ MongoDB Connected Successfully!`);
      console.log(`📍 Host: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      console.log(`🔧 Driver: ${mongoose.version}`);
      
      // Test database operations
      await testDatabaseOperations();
      
      return true;
    } catch (error) {
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}): ${error.message}`);
      
      // Enhanced error handling
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 Local MongoDB likely not running.');
        console.error('   Start MongoDB: mongod --dbpath /path/to/your/db');
        if (uri.includes('localhost') || uri.includes('::1')) {
          console.error('   Try: MONGO_URI=mongodb://127.0.0.1:27017/yourdb');
        }
      } else if (error.message.includes('authentication failed')) {
        console.error('💡 Authentication failed. Check credentials in MONGO_URI.');
        console.error('   Format: mongodb://username:password@host/database');
        break; // Don't retry auth errors
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        console.error('💡 Cannot resolve MongoDB host. Check network and URI.');
        if (uri.includes('mongodb+srv://')) {
          console.error('   Ensure DNS can resolve Atlas cluster');
        }
      } else if (error.message.includes('SSL')) {
        console.error('💡 SSL/TLS error. Check Atlas configuration.');
        console.error('   Ensure IP whitelist includes your address');
      }

      if (attempt < maxAttempts) {
        const delay = baseDelay * attempt;
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  console.error('❌ All MongoDB connection attempts failed.');
  console.error('💡 Troubleshooting:');
  console.error('   1. Check if MongoDB is running (local)');
  console.error('   2. Verify MONGO_URI environment variable');
  console.error('   3. Check network connectivity (Atlas)');
  console.error('   4. Verify credentials and IP whitelist (Atlas)');
  return false;
};

// Test database operations
const testDatabaseOperations = async () => {
  try {
    console.log('🧪 Testing database operations...');
    
    // Test basic read/write
    const testCollection = mongoose.connection.db.collection('connection_test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    await testCollection.deleteMany({ test: true });
    
    console.log('✅ Database operations test passed');
    return true;
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message);
    return false;
  }
};

// Knowledge file linking system
const linkKnowledgeFiles = async () => {
  console.log('📚 Linking Knowledge Files to Database');
  console.log('======================================');
  
  try {
    const knowledgeDir = path.join(__dirname, '..', 'knowledge');
    
    // Ensure knowledge directory exists
    try {
      await fs.access(knowledgeDir);
    } catch {
      console.log('📁 Creating knowledge directory...');
      await fs.mkdir(knowledgeDir, { recursive: true });
    }
    
    // Scan for knowledge files
    const files = await fs.readdir(knowledgeDir);
    const knowledgeFiles = files.filter(file => 
      file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.txt') || file.endsWith('.md')
    );
    
    console.log(`📄 Found ${knowledgeFiles.length} knowledge files`);
    
    // Process each knowledge file
    for (const file of knowledgeFiles) {
      await processKnowledgeFile(file, knowledgeDir);
    }
    
    console.log('✅ Knowledge files linked successfully');
    return true;
  } catch (error) {
    console.error('❌ Error linking knowledge files:', error.message);
    return false;
  }
};

// Process individual knowledge file
const processKnowledgeFile = async (file, knowledgeDir) => {
  try {
    const filePath = path.join(knowledgeDir, file);
    const content = await fs.readFile(filePath, 'utf8');
    
    let knowledgeData;
    
    if (file.endsWith('.js')) {
      // Handle JavaScript knowledge files
      delete require.cache[require.resolve(filePath)];
      knowledgeData = require(filePath);
    } else if (file.endsWith('.json')) {
      // Handle JSON knowledge files
      knowledgeData = JSON.parse(content);
    } else {
      // Handle text/markdown files
      knowledgeData = {
        type: 'text',
        content: content,
        filename: file,
        category: path.basename(file, path.extname(file))
      };
    }
    
    // Save to database
    const KnowledgeFile = mongoose.model('KnowledgeFile', new mongoose.Schema({
      filename: String,
      category: String,
      type: String,
      content: mongoose.Schema.Types.Mixed,
      metadata: {
        size: Number,
        created: Date,
        modified: Date,
        tags: [String]
      },
      linked: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }));
    
    // Upsert knowledge file
    await KnowledgeFile.findOneAndUpdate(
      { filename: file },
      {
        $set: {
          category: knowledgeData.category || path.basename(file, path.extname(file)),
          type: knowledgeData.type || path.extname(file).substring(1),
          content: knowledgeData,
          'metadata.size': content.length,
          'metadata.created': new Date(),
          'metadata.modified': new Date(),
          'metadata.tags': knowledgeData.tags || [],
          linked: true,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Linked: ${file}`);
  } catch (error) {
    console.error(`❌ Failed to link ${file}:`, error.message);
  }
};

// Enhanced save functionality
const saveToDatabase = async (data, collection = 'general') => {
  try {
    if (!mongoose.connection.readyState) {
      throw new Error('Database not connected');
    }
    
    const DynamicSchema = new mongoose.Schema({}, { strict: false, collection });
    const Model = mongoose.model(collection, DynamicSchema);
    
    const document = new Model({
      ...data,
      timestamp: new Date(),
      saved: true
    });
    
    const result = await document.save();
    console.log(`✅ Data saved to ${collection}:`, result._id);
    return result;
  } catch (error) {
    console.error(`❌ Failed to save to ${collection}:`, error.message);
    throw error;
  }
};

// Initialize database with knowledge linking
const initializeEnhancedDB = async () => {
  console.log('🚀 Initializing Enhanced Database System');
  console.log('======================================');
  
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    
    // Link knowledge files
    await linkKnowledgeFiles();
    
    console.log('✅ Enhanced database system ready');
    return true;
  } catch (error) {
    console.error('❌ Enhanced database initialization failed:', error.message);
    return false;
  }
};

module.exports = {
  connectDB,
  linkKnowledgeFiles,
  saveToDatabase,
  initializeEnhancedDB,
  testDatabaseOperations
};
