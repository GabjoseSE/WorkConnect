const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
let Profile;
try {
  Profile = require('../models/Profile');
} catch (e) {
  Profile = null;
}

// in-memory fallback store when MongoDB isn't connected (dev mode)
const inMemoryProfiles = new Map();
function isDbConnected() {
  return mongoose && mongoose.connection && mongoose.connection.readyState === 1 && Profile;
}

// create or update profile
router.post('/', auth, async (req, res) => {
  try {
    // prefer authenticated userId
    const authUserId = req.userId;
    const { email, userId } = req.body;
    const effectiveUserId = authUserId || userId;
    if (!email && !effectiveUserId) return res.status(400).json({ error: 'email or userId required' });

    if (!isDbConnected()) {
      // dev fallback: store in memory
      const existing = inMemoryProfiles.get(email);
      const record = Object.assign({}, existing || {}, req.body, { createdAt: existing ? existing.createdAt : new Date() });
      inMemoryProfiles.set(email, record);
      return res.status(existing ? 200 : 201).json(record);
    }

  let profile;
  if (effectiveUserId) profile = await Profile.findOne({ userId: effectiveUserId });
    if (!profile && email) profile = await Profile.findOne({ email });

    if (profile) {
      profile = Object.assign(profile, req.body);
  if (effectiveUserId) profile.userId = effectiveUserId;
      await profile.save();
      return res.json(profile);
    }

    const newProfileData = Object.assign({}, req.body);
  if (effectiveUserId) newProfileData.userId = effectiveUserId;
    profile = new Profile(newProfileData);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// get profile by userId or email
router.get('/', async (req, res) => {
  try {
    const { email, userId } = req.query;
    // attempt to extract userId from Authorization header if present
    let authUserId = req.userId; // may be set if auth middleware ran earlier
    const authHeader = req.headers && req.headers.authorization;
    if (!authUserId && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        authUserId = decoded.userId;
      } catch (e) {
        // ignore invalid token here; we'll fallback to query params
      }
    }

    if (!email && !userId && !authUserId) return res.status(400).json({ error: 'email or userId query required' });

    if (!isDbConnected()) {
      const key = email || userId || authUserId;
      const profile = inMemoryProfiles.get(key);
      if (!profile) return res.status(404).json({ error: 'not found' });
      return res.json(profile);
    }

    let profile;
    if (authUserId) profile = await Profile.findOne({ userId: authUserId });
    if (!profile && userId) profile = await Profile.findOne({ userId });
    if (!profile && email) profile = await Profile.findOne({ email });
    if (!profile) return res.status(404).json({ error: 'not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
