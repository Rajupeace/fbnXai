const mongoose = require('mongoose');

const debugLogSchema = new mongoose.Schema({
  source: { type: String, default: 'app' },
  payload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DebugLog', debugLogSchema, 'debug_logs');
