const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
    studentId: {
        type: String, // String to match SID or ObjectId
        required: true,
        ref: 'Student'
    },
    totalFee: {
        type: Number,
        required: true,
        default: 0
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Overdue', 'Partial'],
        default: 'Pending'
    },
    transactions: [{
        transactionId: String,
        amount: Number,
        date: { type: Date, default: Date.now },
        method: { type: String, enum: ['Card', 'UPI', 'Net Banking', 'Cash'], default: 'UPI' },
        receiptUrl: String,
        status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Success' }
    }],
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Fee', FeeSchema);
