const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
    studentId: { type: String, required: true, index: true },
    subject: { type: String, required: true, index: true },
    assessmentType: {
        type: String,
        required: true,
        enum: ['cla1', 'cla2', 'cla3', 'cla4', 'cla5',
            'm1t1', 'm1t2', 'm1t3', 'm1t4',
            'm2t1', 'm2t2', 'm2t3', 'm2t4']
    },
    marks: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Compound index for faster queries
markSchema.index({ studentId: 1, subject: 1, assessmentType: 1 }, { unique: true });

module.exports = mongoose.models.Mark || mongoose.model('Mark', markSchema);
