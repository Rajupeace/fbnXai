const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'FaCode' },
    color: { type: String, default: '#4f46e5' },
    category: { type: String, default: 'Development' }, // Web, Mobile, Systems, AI, Data
    levels: [
        {
            title: { type: String, required: true }, // e.g. "Beginner: The Essentials"
            subtitle: { type: String }, // e.g. "Weeks 1-4"
            description: { type: String },
            topics: [
                {
                    topic: { type: String, required: true },
                    isCompleted: { type: Boolean, default: false }
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
