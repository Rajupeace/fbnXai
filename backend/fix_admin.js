const mongoose = require('mongoose');

// Default MongoDB URI (fallback)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/friendly_notebook';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected to:', MONGO_URI);
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const adminSchema = new mongoose.Schema({
    adminId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, default: 'Administrator' },
    adminToken: { type: String },
    tokenIssuedAt: { type: Date }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

const fixAdmin = async () => {
    await connectDB();

    const adminId = 'ReddyFBN@1228';
    const password = 'ReddyFBN';

    try {
        let admin = await Admin.findOne({ adminId });
        if (admin) {
            console.log('Admin found. Updating password...');
            admin.password = password;
            await admin.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Admin not found in MongoDB. Creating new Admin...');
            admin = await Admin.create({
                adminId,
                password,
                name: 'Main Administrator'
            });
            console.log('Admin created successfully.');
        }
    } catch (error) {
        console.error('Error fixing admin:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

fixAdmin();
