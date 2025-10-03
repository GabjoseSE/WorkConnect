const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');

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

    res.status(201).json({ userId: user._id, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
