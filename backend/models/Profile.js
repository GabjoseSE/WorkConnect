const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: false },
  role: { type: String, enum: ['jobhunter', 'employer'], default: 'jobhunter' },
  firstName: String,
  lastName: String,
  email: { type: String, required: true },
  phone: String,
  skills: [String],
  resumeUrl: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', ProfileSchema);
