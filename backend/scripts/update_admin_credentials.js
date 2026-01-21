const mongoose = require('mongoose');
const connectDB = require('./config/db');

async function updateAdminCredentials() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const ok = await connectDB();
    
    if (!ok) {
      console.error('❌ MongoDB connection failed');
      process.exit(1);
    }

    console.log('✅ Connected to MongoDB');

    const Admin = require('./models/Admin');

    // New credentials
    const newAdminId = 'BobbyFNB@09=';
    const newPassword = 'Martin@FNB09';

    // Remove all existing admins
    console.log('🗑️  Clearing existing admin records...');
    await Admin.deleteMany({});

    // Create new admin with updated credentials
    console.log('📝 Creating new admin with updated credentials...');
    const newAdmin = await Admin.create({
      adminId: newAdminId,
      password: newPassword,
      name: 'Administrator',
      email: 'admin@fbnxai.edu'
    });

    console.log('✅ Admin credentials updated successfully!');
    console.log(`   adminId: ${newAdminId}`);
    console.log(`   password: ${newPassword}`);
    console.log(`   name: ${newAdmin.name}`);

    // Verify the admin was created
    const verifyAdmin = await Admin.findOne({ adminId: newAdminId });
    if (verifyAdmin && verifyAdmin.password === newPassword) {
      console.log('✅ Verification: Admin credentials are correct in database!');
    } else {
      console.warn('⚠️  Verification failed. Please check manually.');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin credentials:', err);
    process.exit(1);
  }
}

updateAdminCredentials();
