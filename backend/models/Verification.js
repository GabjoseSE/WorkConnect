const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  contact: { type: String, required: true }, // email or phone
  method: { type: String, enum: ['email','sms'], required: true },
  code: { type: String, required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verification', VerificationSchema);
