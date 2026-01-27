const mongoose = require('mongoose');

const placementCompanySchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    color: { type: String, default: '#3b82f6' },
    description: String,

    hiringRole: { type: String, default: 'Software Engineer' },
    package: { type: String, default: '3.5 - 7 LPA' },

    // Domains available at this company
    domains: [{ type: String }], // e.g. ['Frontend', 'Backend', 'Full Stack']

    resources: [{
        title: String,
        link: String,
        type: { type: String, default: 'link' }
    }],

    questions: [{
        question: { type: String, required: true },
        answer: { type: String },
        category: { type: String, default: 'Technical' }, // Technical, HR, Aptitude
        domain: { type: String, default: 'General' }, // Frontend, Backend, Full Stack, SDE
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlacementCompany', placementCompanySchema);
