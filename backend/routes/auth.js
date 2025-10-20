const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const EmployersProfile = require('../models/employersProfile'); // ✅ add this line

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, ...profileData } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    let existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'user exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash: hash });
    await user.save();

    // ✅ Save a generic profile
    const profile = await Profile.create({
      userId: user._id,
      email,
      role: role || 'jobhunter',
      ...profileData,
    });

    // ✅ If employer, create a separate employer profile
    if (role === 'employer') {
      // Build employer payload but do not include empty strings for enum fields
      const employerPayload = {
        userId: user._id,
        companyName: profileData.companyName || '',
        companyWebsite: profileData.companyWebsite || '',
        industry: profileData.industry || '',
        companyStreetAddress: profileData.companyStreetAddress || '',
        companyCity: profileData.companyCity || '',
        companyRegion: profileData.companyRegion || '',
        companyPostalCode: profileData.companyPostalCode || '',
        companyCountry: profileData.companyCountry || '',
        companyLocation: profileData.companyLocation || '',
        companyDescription: profileData.companyDescription || '',
        companyLogo: profileData.companyLogo || '',
        linkedin: profileData.linkedin || '',
        ownerName: profileData.ownerName || '',
        ownerPosition: profileData.ownerPosition || '',
        ownerPhone: profileData.ownerPhone || '',
        phoneCountry: profileData.phoneCountry || '+63',
        ownerEmail: email,
        emailVerified: !!profileData.emailVerified,
      };

      // Only include companySize if provided and non-empty to satisfy enum validation
      if (profileData.companySize) {
        employerPayload.companySize = profileData.companySize;
      }

      await EmployersProfile.create(employerPayload);
    }

    res.status(201).json({ userId: user._id, role, profile });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/auth/exists?email=foo@bar.com
router.get('/exists', async (req, res) => {
  try {
    const email = (req.query.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email required' });
    const existing = await User.findOne({ email });
    res.json({ exists: !!existing });
  } catch (err) {
    console.error('Exists check error', err);
    res.status(500).json({ error: 'server error' });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword)
      return res.status(401).json({ error: 'Invalid credentials' });

    // create JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

    // ✅ Success — return token and userId
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
