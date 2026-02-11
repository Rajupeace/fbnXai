#!/usr/bin/env node

/**
 * FIX COLLECTION NAMES
 * Moves data to correct collection names expected by models
 */

const path = require('path');
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    return true;
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    return false;
  }
}

async function fixCollections() {
  const db = mongoose.connection.db;
  
  console.log('🔧 FIXING COLLECTION NAMES\n');

  try {
    // Check if materials collection has data
    const materialsCount = await db.collection('materials').countDocuments();
    const adminMaterialsCount = await db.collection('AdminDashboardDB_Sections_Materials').countDocuments();
    
    console.log(`📊 Current state:`);
    console.log(`   - materials: ${materialsCount} documents`);
    console.log(`   - AdminDashboardDB_Sections_Materials: ${adminMaterialsCount} documents\n`);

    // If materials has data and AdminDashboardDB_Sections_Materials doesn't, move it
    if (materialsCount > 0 && adminMaterialsCount === 0) {
      console.log('📋 Moving materials data...');
      const materials = await db.collection('materials').find({}).toArray();
      
      if (materials.length > 0) {
        await db.collection('AdminDashboardDB_Sections_Materials').insertMany(materials);
        console.log(`✅ Inserted ${materials.length} materials into AdminDashboardDB_Sections_Materials\n`);
      }
    } else if (adminMaterialsCount > 0) {
      console.log('✅ AdminDashboardDB_Sections_Materials already has data\n');
    }

    // Check exams
    const examsCount = await db.collection('exams').countDocuments();
    const studentExamsCount = await db.collection('StudentDashboardDB_Sections_Exams').countDocuments();
    
    console.log(`📊 Exams state:`);
    console.log(`   - exams: ${examsCount} documents`);
    console.log(`   - StudentDashboardDB_Sections_Exams: ${studentExamsCount} documents\n`);

    if (examsCount > 0 && studentExamsCount === 0) {
      console.log('📋 Moving exams data...');
      const exams = await db.collection('exams').find({}).toArray();
      
      if (exams.length > 0) {
        await db.collection('StudentDashboardDB_Sections_Exams').insertMany(exams);
        console.log(`✅ Inserted ${exams.length} exams into StudentDashboardDB_Sections_Exams\n`);
      }
    } else if (studentExamsCount > 0) {
      console.log('✅ StudentDashboardDB_Sections_Exams already has data\n');
    }

    console.log('✅ Collection migration complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   FIX COLLECTION NAMES & DATA                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  try {
    await fixCollections();
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

main();
