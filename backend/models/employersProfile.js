const mongoose = require('mongoose');

const employersProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  passwordHash: { type: String, required: true },
  companyWebsite: { type: String },
  industry: { type: String },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  },
  companyStreetAddress: { type: String },
  companyCity: { type: String },
  companyRegion: { type: String },
  companyPostalCode: { type: String },
  companyCountry: { type: String },
  companyLocation: { type: String },
  ownerName: { type: String },
  ownerPosition: { type: String },
  ownerPhone: { type: String },
  phoneCountry: { type: String, default: '+63' },
  ownerEmail: { type: String },
  companyDescription: { type: String },
  companyLogo: { type: String },
  linkedin: { type: String },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

employersProfileSchema.index({ userId: 1 });
employersProfileSchema.index({ companyName: 1 });

module.exports = mongoose.model('EmployersProfile', employersProfileSchema);
