const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// In-memory fallback when MongoDB is not configured (useful for local dev)
const isDevFallback = (!process.env.MONGO_URI) || process.env.SKIP_MONGO === '1' || process.env.SKIP_MONGO === 'true';
let _memApps = [];

// Submit application
router.post('/send', async (req, res) => {
  try {
    const data = req.body;
    // minimal validation
    if (!data.applicantId || !data.employerId || !data.jobId) return res.status(400).json({ error: 'Missing required fields' });

    // If we're in dev fallback mode (no Mongo), store in-memory
    if (isDevFallback) {
      const id = String(Date.now()) + '-' + Math.round(Math.random() * 1e9);
      const app = {
        _id: id,
        applicantId: data.applicantId,
        employerId: data.employerId,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        fullName: data.fullName,
        email: data.email,
        contactNumber: data.contactNumber,
        location: data.location,
        profilePictureUrl: data.profilePictureUrl,
        resumeUrl: data.resumeUrl,
        education: data.education || {},
        workExperience: data.workExperience || [],
        skills: data.skills || [],
        certificates: data.certificates || [],
        coverLetter: data.coverLetter,
        expectedSalary: data.expectedSalary,
        availability: data.availability,
        applicationDate: data.applicationDate ? new Date(data.applicationDate) : new Date(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      _memApps.unshift(app);
      return res.json({ application: app });
    }

    const app = new Application({
      applicantId: data.applicantId,
      employerId: data.employerId,
      jobId: data.jobId,
      jobTitle: data.jobTitle,
      fullName: data.fullName,
      email: data.email,
      contactNumber: data.contactNumber,
      location: data.location,
      profilePictureUrl: data.profilePictureUrl,
      resumeUrl: data.resumeUrl,
      education: data.education || {},
      workExperience: data.workExperience || [],
      skills: data.skills || [],
      certificates: data.certificates || [],
      coverLetter: data.coverLetter,
      expectedSalary: data.expectedSalary,
      availability: data.availability,
      applicationDate: data.applicationDate ? new Date(data.applicationDate) : new Date(),
      status: 'pending'
    });

    await app.save();
    return res.json({ application: app });
  } catch (err) {
    console.error('Application send error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get applications for an employer
router.get('/employer/:employerId', async (req, res) => {
  try {
    const { employerId } = req.params;
    if (isDevFallback) {
      const apps = _memApps.filter(a => String(a.employerId) === String(employerId));
      apps.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ applications: apps });
    }
    const apps = await Application.find({ employerId }).sort({ createdAt: -1 }).lean();
    return res.json({ applications: apps });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get application by id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isDevFallback) {
      const app = _memApps.find(a => String(a._id) === String(id));
      if (!app) return res.status(404).json({ error: 'Not found' });
      return res.json({ application: app });
    }
    const app = await Application.findById(id).lean();
    if (!app) return res.status(404).json({ error: 'Not found' });
    return res.json({ application: app });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
