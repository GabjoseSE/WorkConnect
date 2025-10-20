const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const EmployersProfile = require('../models/employersProfile');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    // Try to find user in both collections
    let user = await Profile.findOne({ email });
    let role = 'jobhunter';

    if (!user) {
      user = await EmployersProfile.findOne({ ownerEmail: email });
      role = 'employer';
    }

    if (!user)
      return res.status(404).json({ error: 'Account not found' });

    // Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: email, role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      userId: user._id,
      role,
      message: 'Login successful',
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;