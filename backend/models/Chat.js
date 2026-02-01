const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: { type: String, default: 'guest', index: true },
  role: { type: String, default: 'student', index: true },
  message: { type: String, required: true },
  response: { type: String },
  context: { type: Object },
  timestamp: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Chat', chatSchema, 'chats');
