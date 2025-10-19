const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  type: { type: String },
  minSalary: { type: Number, required: false },
  maxSalary: { type: Number, required: false },
  currency: { type: String, required: false },
  salaryFrequency: { type: String, required: false },
  logoName: { type: String, required: false },
  logoUrl: { type: String, required: false },
  summary: { type: String },
  description: { type: String },
  easyApply: { type: Boolean, default: false },
  isRemote: { type: Boolean, default: false },
  isHybrid: { type: Boolean, default: false },
  isFullTime: { type: Boolean, default: false },
  postedAt: { type: Date, default: Date.now },
  applied: { type: Boolean, default: false },
  exclusive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }
});

module.exports = mongoose.model('Job', JobSchema);
