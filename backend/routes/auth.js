// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Profile = require('../models/Profile');
const EmployersProfile = require('../models/employersProfile');
const jwt = require('jsonwebtoken');

// SIGNUP — create either jobhunter or employer
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    // check if email already exists in either profile
    const existingProfile = await Profile.findOne({ email });
    const existingEmployer = await EmployersProfile.findOne({ ownerEmail: email });
    if (existingProfile || existingEmployer)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);

    if (role === 'employer') {
      const employer = new EmployersProfile({
        emailVerified: false,
        ownerEmail: email,
        ownerName: profileData.ownerName || '',
        ownerPosition: profileData.ownerPosition || '',
        ownerPhone: profileData.ownerPhone || '',
        companyName: profileData.companyName || '',
        companyWebsite: profileData.companyWebsite || '',
        companyDescription: profileData.companyDescription || '',
        industry: profileData.industry || '',
        companySize: profileData.companySize || '',
        companyLocation: profileData.companyLocation || '',
        companyLogo: profileData.companyLogo || '',
        linkedin: profileData.linkedin || '',
        passwordHash: hash, // store password here for employers
      });
      await employer.save();
      return res.status(201).json({ role: 'employer', id: employer._id });
    }

    // Default: jobhunter
    const jobhunter = new Profile({
      email,
      passwordHash: hash,
      role: 'jobhunter',
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      skills: profileData.skills || [],
      resumeUrl: profileData.resumeUrl || '',
    });
    await jobhunter.save();

    res.status(201).json({ role: 'jobhunter', id: jobhunter._id });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// LOGIN — works for both profiles
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    let account =
      (await Profile.findOne({ email })) ||
      (await EmployersProfile.findOne({ ownerEmail: email }));

    if (!account)
      return res.status(404).json({ error: 'Account not found' });

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Sign token with `userId` to match auth middleware expectation
    const token = jwt.sign(
      { userId: account._id, email, role: account.role || 'employer' },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    // Return userId field (frontend expects userId or id; prefer userId)
    res.json({ token, userId: account._id, role: account.role || 'employer' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
