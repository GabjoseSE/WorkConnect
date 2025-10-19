const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  type: { type: String },
  minSalary: Number,
  maxSalary: Number,
  currency: String,
  salaryFrequency: String,
  logoName: String,
  logoUrl: String,
  summary: String,
  description: String,
  easyApply: { type: Boolean, default: false },
  isRemote: { type: Boolean, default: false },
  isHybrid: { type: Boolean, default: false },
  isFullTime: { type: Boolean, default: false },
  postedAt: { type: Date, default: Date.now },
  applied: { type: Boolean, default: false },
  exclusive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
});

module.exports = mongoose.model('Job', JobSchema);