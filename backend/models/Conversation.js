const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  title: { type: String },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // users who have archived this conversation (hidden from their main list)
  archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String },
}, { timestamps: true });

conversationSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
