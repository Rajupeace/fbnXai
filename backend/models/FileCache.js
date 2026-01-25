const mongoose = require('mongoose');

const fileCacheSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileCache', fileCacheSchema, 'file_cache');
