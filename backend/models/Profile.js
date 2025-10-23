const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  // Basic account info
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['jobhunter'], default: 'jobhunter' },

  // Personal info
  firstName: String,
  lastName: String,
  gender: String,
  dob: Date, // maps from data.dateOfBirth
  nationality: String,

  // Contact and location
  phone: String,
  phoneCountry: String,
  country: String,
  addressLine: String,
  city: String,
  stateprovince: String,
  postalCode: String,
  image: String, // profile avatar
  bio: String,
  linkedin: String,

  // Job preferences
  desiredJobType: String,
  workArrangement: String, // e.g. remote, hybrid, on-site
  expectedSalary: String,

  // Professional info
  skills: [String],
  languages: [String],
  portfolio: [String],
  certifications: [String],

  // Experience and education
  experience: [
    {
      company: String,
      position: String,
      duration: String,
      description: String,
    },
  ],
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startYear: String,
      endYear: String,
      status: String, // e.g., Enrolled, Graduated
      description: String,
    },
  ],

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', ProfileSchema);
