const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, ...profileData } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    // check existing user
    let existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'user exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ email, passwordHash: hash });
    await user.save();

    // create or update profile and link by userId
    let profile = await Profile.findOne({ email });
    if (profile) {
      profile = Object.assign(profile, profileData);
      profile.userId = user._id;
      await profile.save();
    } else {
      profile = new Profile(Object.assign({}, profileData, { email, userId: user._id }));
      await profile.save();
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // e.g. "426193"
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 mins
    await user.save();

    
    res.status(201).json({ userId: user._id, profile });
  } catch (err) {
    console.error(err);
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

    // ✅ Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      userId: user._id,
      email: user.email,
      token, // ✅ include token here
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
