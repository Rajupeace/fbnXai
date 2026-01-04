const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    adminToken: {
        type: String,
        default: null
    },
    tokenIssuedAt: {
        type: Date,
        default: null
    },
    name: {
        type: String,
        default: 'Administrator'
    },
    role: {
        type: String,
        default: 'admin'
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
