const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  role: { type: String, enum: ['jobhunter', 'employer'], default: 'jobhunter' },
  firstName: String,
  lastName: String,
  email: { type: String, required: true },
  companyName: String,
  companyWebsite: String,
  companyDescription: String,
  companyLogo: String,
  industry: String,
  companySize: String,
  companyLocation: String,
  linkedin: String,
  ownerName: String,
  ownerPosition: String,
  ownerPhone: String,
  phone: String,
  skills: [String],
  image: String, // avatar/profile image url
  bio: String,
  languages: [String],
  portfolio: [String],
  certifications: [String],
  experience: [
    {
      company: String,
      position: String,
      duration: String,
      description: String,
    }
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
    }
  ],
  gender: String,
  dob: Date,
  nationality: String,
  desiredJobType: String,
  workArrangement: String,
  expectedSalary: String,
  resumeUrl: String,
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', ProfileSchema);