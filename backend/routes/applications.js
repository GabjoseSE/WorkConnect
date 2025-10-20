const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Submit application
router.post('/send', async (req, res) => {
  try {
    const data = req.body;
    // minimal validation
    if (!data.applicantId || !data.employerId || !data.jobId) return res.status(400).json({ error: 'Missing required fields' });

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
    const app = await Application.findById(req.params.id).lean();
    if (!app) return res.status(404).json({ error: 'Not found' });
    return res.json({ application: app });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
