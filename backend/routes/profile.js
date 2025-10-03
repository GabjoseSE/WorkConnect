const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// create or update profile
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    let profile = await Profile.findOne({ email });
    if (profile) {
      profile = Object.assign(profile, req.body);
      await profile.save();
      return res.json(profile);
    }

    profile = new Profile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// get profile by email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email query required' });
    const profile = await Profile.findOne({ email });
    if (!profile) return res.status(404).json({ error: 'not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
