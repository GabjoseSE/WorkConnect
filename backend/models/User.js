const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic auth
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  //username for login (if you plan to support that later)
  username: { type: String, unique: true, sparse: true },

  // Role-based access (job hunter, employer, admin, etc.)
  role: {
    type: String,
    enum: ['jobhunter', 'employer', 'admin'],
    default: 'jobhunter',
  },

  // Account status
  isVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },

  // For password reset / OTP
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },

  // Tracking
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  
  // Code generation when creating the account
  otpCode: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },

});

module.exports = mongoose.model('User', UserSchema);
