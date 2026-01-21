#!/usr/bin/env node

/**
 * MONGODB DATABASE CHECKER
 * Checks MongoDB connection and database status
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

class MongoDBChecker {
  constructor() {
    this.uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';
    this.results = {
      connectionStatus: null,
      collections: [],
      documentCount: {}
    };
  }

  log(type, message) {
    const icons = {
      '✅': colors.green,
      '❌': colors.red,
      '⚠️': colors.yellow,
      'ℹ': colors.cyan,
      '🔍': colors.magenta
    };
    
    const color = icons[type] || colors.reset;
    console.log(`${color}${type}${colors.reset} ${message}`);
  }

  section(title) {
    console.log(`\n${colors.cyan}${'═'.repeat(70)}${colors.reset}`);
    console.log(`${colors.magenta}${title}${colors.reset}`);
    console.log(`${colors.cyan}${'═'.repeat(70)}${colors.reset}\n`);
  }

  async checkConnection() {
    this.section('🔌 MONGODB CONNECTION CHECK');

    try {
      const uri = this.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      this.log('ℹ', `Connection String: ${uri}`);
      this.log('ℹ', `Attempting connection...`);

      await mongoose.connect(this.uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4
      });

      this.log('✅', `Connected Successfully!`);
      this.results.connectionStatus = true;

      // Get connection info
      const conn = mongoose.connection;
      this.log('✅', `Host: ${conn.host}`);
      this.log('✅', `Port: ${conn.port}`);
      this.log('✅', `Database: ${conn.name}`);
      this.log('✅', `Status: ${conn.readyState === 1 ? 'Connected' : 'Not Connected'}`);

    } catch (error) {
      this.log('❌', `Connection Failed: ${error.message}`);
      this.results.connectionStatus = false;
      
      if (error.message.includes('ECONNREFUSED')) {
        this.log('⚠️', 'MongoDB is not running. Start with: mongod');
      }
      
      throw error;
    }
  }

  async checkCollections() {
    this.section('📦 DATABASE COLLECTIONS CHECK');

    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      if (collections.length === 0) {
        this.log('⚠️', 'No collections found in database');
        return;
      }

      this.log('✅', `Found ${collections.length} collections:`);
      this.log('ℹ', '');

      for (const collection of collections) {
        const coll = db.collection(collection.name);
        const count = await coll.countDocuments();
        
        this.results.collections.push(collection.name);
        this.results.documentCount[collection.name] = count;

        const status = count > 0 ? '✅' : '⚠️';
        const docs = count > 0 ? `${count} documents` : 'empty';
        this.log(status, `${collection.name.padEnd(20)} → ${docs}`);
      }

    } catch (error) {
      this.log('❌', `Error checking collections: ${error.message}`);
    }
  }

  async checkConnections() {
    this.section('🔗 DATABASE CONNECTIONS');

    try {
      const db = mongoose.connection.db;
      const serverStatus = await db.admin().serverStatus();

      this.log('✅', `Server Version: ${serverStatus.version}`);
      this.log('✅', `Uptime: ${serverStatus.uptime} seconds`);
      this.log('✅', `Active Connections: ${serverStatus.connections?.current || 'N/A'}`);
      this.log('✅', `Available Connections: ${serverStatus.connections?.available || 'N/A'}`);

    } catch (error) {
      this.log('❌', `Error getting server status: ${error.message}`);
    }
  }

  async checkIndexes() {
    this.section('📇 DATABASE INDEXES');

    try {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();

      for (const collection of collections) {
        const coll = db.collection(collection.name);
        const indexes = await coll.getIndexes();
        
        this.log('✅', `${collection.name}: ${Object.keys(indexes).length} indexes`);
      }

    } catch (error) {
      this.log('❌', `Error checking indexes: ${error.message}`);
    }
  }

  async generateReport() {
    this.section('📊 DATABASE STATUS REPORT');

    console.log(`${colors.cyan}Connection Status:${colors.reset}`);
    console.log(`  ${this.results.connectionStatus ? '✅ Connected' : '❌ Disconnected'}`);

    console.log(`\n${colors.cyan}Collections:${colors.reset}`);
    console.log(`  Total: ${this.results.collections.length}`);
    
    const totalDocuments = Object.values(this.results.documentCount).reduce((a, b) => a + b, 0);
    console.log(`  Documents: ${totalDocuments}`);

    console.log(`\n${colors.cyan}Collection Details:${colors.reset}`);
    for (const [collection, count] of Object.entries(this.results.documentCount)) {
      console.log(`  • ${collection.padEnd(20)} ${count} documents`);
    }

    console.log(`\n${colors.green}✅ DATABASE CHECK COMPLETE${colors.reset}`);
  }

  async run() {
    console.clear();
    this.log('ℹ', '🔍 Starting MongoDB Database Check...\n');

    try {
      await this.checkConnection();
      await this.checkCollections();
      await this.checkConnections();
      await this.checkIndexes();
      await this.generateReport();

      this.section('💡 NEXT STEPS');
      console.log('1. Verify collections have data');
      console.log('2. Check connection pooling status');
      console.log('3. Monitor performance metrics');
      console.log('4. Run dashboard verification: node dashboard-verify.js');

    } catch (error) {
      this.log('❌', `Critical Error: ${error.message}`);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      this.log('ℹ', 'MongoDB connection closed');
    }
  }
}

// Run checker
const checker = new MongoDBChecker();
checker.run().catch(console.error);
