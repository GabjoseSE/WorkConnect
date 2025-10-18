const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail'); // <-- use your Gmail-based email sender
let Verification;

try {
  Verification = require('../models/Verification');
} catch (e) {
  Verification = null;
}

// In-memory fallback if DB is not connected
const inMemory = new Map();
function isDbConnected() {
  return mongoose && mongoose.connection && mongoose.connection.readyState === 1 && Verification;
}

// OTP generator (6-digit)
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/verify/send  -> sends OTP
router.post('/send', async (req, res) => {
  try {
    const { contact, method } = req.body;
    if (!contact || !method) {
      return res.status(400).json({ error: 'contact and method required' });
    }

    const code = generateCode();
    const ttl = parseInt(process.env.VERIFY_TTL_SECONDS || '900', 10); // default 15 min (900s)
    const expiresAt = new Date(Date.now() + ttl * 1000);

    // Save OTP (in DB or memory)
    if (!isDbConnected()) {
      inMemory.set(contact, { code, method, expiresAt });
    } else {
      await Verification.create({ contact, method, code, expiresAt });
    }

    // ✅ Send OTP via email
    if (method === 'email') {
      const subject = 'Your WorkConnect Verification Code';
      const text = `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`;
      await sendEmail(contact, subject, text);
      return res.json({ success: true, message: 'Verification code sent to your email' });
    }

    // For SMS (optional future support)
    if (method === 'sms') {
      console.log(`SMS verification not yet implemented for: ${contact}`);
      return res.json({ success: false, error: 'SMS not implemented' });
    }

    // If method unknown
    res.status(400).json({ error: 'Unsupported verification method' });

  } catch (err) {
    console.error('verify/send error:', err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// POST /api/verify/verify  -> verifies OTP
router.post('/verify', async (req, res) => {
  try {
    const { contact, code } = req.body;
    if (!contact || !code) {
      return res.status(400).json({ error: 'contact and code required' });
    }

    // If DB not connected, use memory
    if (!isDbConnected()) {
      const rec = inMemory.get(contact);
      if (!rec) return res.status(400).json({ valid: false });
      if (new Date() > rec.expiresAt) return res.status(400).json({ valid: false, error: 'expired' });
      if (rec.code !== code) return res.status(400).json({ valid: false });

      inMemory.delete(contact);
      return res.json({ valid: true });
    }

    // Verify in MongoDB
    const rec = await Verification.findOne({ contact, code, used: false }).sort({ createdAt: -1 });
    if (!rec) return res.status(400).json({ valid: false });
    if (new Date() > rec.expiresAt) return res.status(400).json({ valid: false, error: 'expired' });

    rec.used = true;
    await rec.save();

    return res.json({ valid: true });
  } catch (err) {
    console.error('verify/verify error', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
