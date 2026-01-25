const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest' },
  role: { type: String, default: 'student' },
  message: { type: String, required: true },
  response: { type: String },
  context: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema, 'chats');
