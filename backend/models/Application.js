const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: String, required: true },
  jobTitle: { type: String },

  // Applicant info snapshot (denormalized)
  fullName: String,
  email: String,
  contactNumber: String,
  location: String,
  profilePictureUrl: String,
  resumeUrl: String,

  // Education
  education: {
    highestAttainment: String,
    school: String,
    course: String,
    yearGraduated: String,
  },

  // Work experience (array)
  workExperience: [{
    jobTitle: String,
    company: String,
    startDate: String,
    endDate: String,
    responsibilities: String,
  }],

  // Skills & attachments
  skills: [String],
  certificates: [String],

  // Application details
  coverLetter: String,
  expectedSalary: String,
  availability: String,
  applicationDate: { type: Date, default: Date.now },

  // System metadata
  status: { type: String, enum: ['pending','reviewed','accepted','rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
