const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Verification = require('../models/Verification');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if DB connected
function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// STEP 1: Request OTP
router.post('/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No user found with that email' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP in DB
    if (isDbConnected()) {
      await Verification.create({
        contact: email,
        method: 'email',
        code: otp,
        expiresAt,
      });
    }

    // Send email
    await sendEmail(
      email,
      'Password Reset Code',
      `Your WorkConnect password reset code is ${otp}. It expires in 15 minutes.`
    );

    console.log(`✅ Sent password reset OTP to ${email}: ${otp}`);
    return res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ Error sending OTP:', err);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// STEP 2: Verify OTP
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: 'Email and OTP required' });

  try {
    const record = await Verification.findOne({
      contact: email,
      code: otp,
      used: false,
    }).sort({ createdAt: -1 });

    if (!record) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > record.expiresAt)
      return res.status(400).json({ error: 'OTP expired' });

    record.used = true;
    await record.save();

    console.log(`✅ OTP verified for ${email}`);
    return res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    console.error('❌ Error verifying OTP:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// STEP 3: Reset Password
router.post('/reset', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword)
    return res.status(400).json({ error: 'Email and new password required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    console.log(`🔐 Password reset successful for ${email}`);
    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('❌ Error resetting password:', err);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = router;
