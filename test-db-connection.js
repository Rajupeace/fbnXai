#!/usr/bin/env node

/**
 * MongoDB Connection Tester
 * Tests local and Atlas connections
 */

const path = require('path');
const mongoose = require(path.join(__dirname, 'backend', 'node_modules', 'mongoose'));
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const testConnections = async () => {
  console.log('🧪 MongoDB Connection Tester\n');
  console.log('='.repeat(50));
  
  // Test 1: Local MongoDB
  console.log('\n1️⃣  Testing LOCAL MongoDB (127.0.0.1:27017)');
  try {
    const localUri = 'mongodb://127.0.0.1:27017/fbn_xai_system';
    console.log(`   URI: ${localUri}`);
    
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4
    });
    
    console.log('✅ LOCAL MongoDB: CONNECTED');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Collections: ${(await conn.connection.db.listCollections().toArray()).length}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ LOCAL MongoDB: FAILED');
    console.log(`   Error: ${error.message}`);
    console.log('   Fix: Install MongoDB or start the MongoDB service');
    console.log('   Guide: See MONGODB_SETUP.md');
  }
  
  // Test 2: Environment Variable
  console.log('\n2️⃣  Testing ENVIRONMENT Variable (MONGO_URI)');
  const envUri = process.env.MONGO_URI;
  if (envUri) {
    console.log(`   URI: ${envUri.substring(0, 50)}...`);
    try {
      const conn = await mongoose.connect(envUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 5000
      });
      
      console.log('✅ MONGO_URI: CONNECTED');
      console.log(`   Host: ${conn.connection.host}`);
      console.log(`   Database: ${conn.connection.name}`);
      
      await mongoose.connection.close();
    } catch (error) {
      console.log('❌ MONGO_URI: FAILED');
      console.log(`   Error: ${error.message}`);
      console.log('   Check: .env file and MONGO_URI value');
    }
  } else {
    console.log('⚠️  No MONGO_URI environment variable found');
    console.log('   Will use default: mongodb://127.0.0.1:27017/fbn_xai_system');
  }
  
  // Test 3: Test different hosts
  console.log('\n3️⃣  Testing Alternative Hosts');
  const hosts = [
    { name: 'localhost', uri: 'mongodb://localhost:27017/test' },
    { name: '127.0.0.1', uri: 'mongodb://127.0.0.1:27017/test' },
    { name: 'Windows Subsystem for Linux', uri: 'mongodb://host.docker.internal:27017/test' }
  ];
  
  for (const host of hosts) {
    try {
      const conn = await mongoose.connect(host.uri, {
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 3000,
        family: 4
      });
      console.log(`   ✅ ${host.name}: Reachable`);
      await mongoose.connection.close();
    } catch (error) {
      console.log(`   ❌ ${host.name}: ${error.message.substring(0, 40)}...`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Recommendations:');
  console.log('   1. For development: Use local MongoDB (easiest)');
  console.log('   2. For production/online: Use MongoDB Atlas');
  console.log('   3. Update .env with your chosen connection');
  console.log('   4. See MONGODB_SETUP.md for detailed instructions\n');
};

testConnections().catch(console.error);
