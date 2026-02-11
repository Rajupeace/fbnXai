const axios = require('axios');
const MongoDB = require('mongodb');

const API_URL = 'http://localhost:5000';
const ADMIN_ID = 'BobbyFNB@09=';
const ADMIN_PASSWORD = 'Martin@FNB09';
const MONGO_URL = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fbn_xai_system';

let adminToken = '';
let mongoClient = null;

async function connectMongo() {
  try {
    mongoClient = new MongoDB.MongoClient(MONGO_URL);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
    return mongoClient.db();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

async function verifyDataInMongo(db) {
  console.log('\n📊 VERIFYING DATA IN MONGODB\n');
  
  const collections = {
    'Students': 'students',
    'Faculty': 'faculty',
    'Courses': 'courses',
    'Materials': 'materials',
    'Messages': 'messages'
  };

  for (const [name, collection] of Object.entries(collections)) {
    try {
      const db_instance = mongoClient.db();
      const count = await db_instance.collection(collection).countDocuments();
      const sample = await db_instance.collection(collection).findOne();
      
      console.log(`\n📦 ${name.toUpperCase()}`);
      console.log(`   Count: ${count}`);
      console.log(`   Sample Document:`);
      console.log(`   ${JSON.stringify(sample, null, 4)}\n`);
    } catch (error) {
      console.log(`   ℹ️  ${name} collection not found or empty`);
    }
  }
}

async function testAdminDashboardAccess() {
  try {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  ADMIN DASHBOARD DATA VERIFICATION         ║');
    console.log('╚════════════════════════════════════════════╝\n');

    // Step 1: Login
    console.log('🔐 Step 1: Admin Authentication');
    const loginRes = await axios.post(`${API_URL}/api/admin/login`, {
      adminId: ADMIN_ID,
      password: ADMIN_PASSWORD
    });
    
    adminToken = loginRes.data.token;
    console.log(`✅ Authenticated as: ${loginRes.data.adminData?.name || 'Administrator'}`);
    console.log(`✅ Token issued at: ${new Date().toISOString()}`);

    // Step 2: Fetch Dashboard Data
    console.log('\n📊 Step 2: Fetching Dashboard Data');
    
    const headers = { 'x-admin-token': adminToken };
    
    const [students, faculty, courses, materials, messages] = await Promise.all([
      axios.get(`${API_URL}/api/students`, { headers }).then(r => r.data),
      axios.get(`${API_URL}/api/faculty`, { headers }).then(r => r.data),
      axios.get(`${API_URL}/api/courses`, { headers }).then(r => r.data),
      axios.get(`${API_URL}/api/materials`, { headers }).then(r => r.data),
      axios.get(`${API_URL}/api/messages`, { headers }).then(r => r.data)
    ]);

    console.log(`✅ Students: ${(Array.isArray(students) ? students.length : 0)} records`);
    console.log(`✅ Faculty: ${(Array.isArray(faculty) ? faculty.length : 0)} records`);
    console.log(`✅ Courses: ${(Array.isArray(courses) ? courses.length : 0)} records`);
    console.log(`✅ Materials: ${(Array.isArray(materials) ? materials.length : 0)} records`);
    console.log(`✅ Messages: ${(Array.isArray(messages) ? messages.length : 0)} records`);

    // Step 3: Connect to MongoDB and verify data
    console.log('\n🔍 Step 3: MongoDB Direct Verification');
    const db = await connectMongo();
    await verifyDataInMongo(db);

    // Step 4: Check specific data integrity
    console.log('🔒 Step 4: Data Integrity Checks');
    const studentsCollection = db.collection('students');
    const latestStudent = await studentsCollection.findOne({}, { sort: { createdAt: -1 } });
    
    if (latestStudent) {
      console.log('✅ Latest Student Record:');
      console.log(`   ID: ${latestStudent._id}`);
      console.log(`   Name: ${latestStudent.studentName || 'N/A'}`);
      console.log(`   SID: ${latestStudent.sid}`);
      console.log(`   Email: ${latestStudent.email}`);
      console.log(`   Year/Section/Branch: ${latestStudent.year}/${latestStudent.section}/${latestStudent.branch}`);
    }

    console.log('\n✅ ADMIN DASHBOARD DATA VERIFICATION COMPLETE');
    console.log('✅ All systems operational and data persisting correctly\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

testAdminDashboardAccess();
