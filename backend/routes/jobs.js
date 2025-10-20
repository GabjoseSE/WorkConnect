const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /api/jobs - list jobs (most recent first)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query && req.query.createdBy) {
      // allow passing a user id to filter jobs created by that user
      filter.createdBy = req.query.createdBy;
    }
    const jobs = await Job.find(filter).sort({ postedAt: -1 }).lean();
    res.json(jobs);
  } catch (e) {
    console.error('Error fetching jobs', e);
    res.status(500).json({ error: 'could not fetch jobs' });
  }
});

// POST /api/jobs - create a new job
router.post('/', async (req, res) => {
  try {
    const body = req.body || {};
    const job = new Job({
      createdBy: body.createdBy,
      title: body.title,
      company: body.company,
      location: body.location,
      type: body.type,
      minSalary: body.minSalary,
      maxSalary: body.maxSalary,
      currency: body.currency,
  salaryFrequency: body.salaryFrequency,
      logoName: body.logoName,
      logoUrl: body.logoUrl,
      summary: body.summary,
      description: body.description,
      numberOpenings: body.numberOpenings,
      applicationMethod: body.applicationMethod,
      applicationTarget: body.applicationTarget,
      postedAt: body.postedAt || Date.now(),
      expirationDate: body.expirationDate,
      easyApply: !!body.easyApply,
      isRemote: !!body.isRemote,
      isHybrid: !!body.isHybrid,
      isFullTime: !!body.isFullTime,
      exclusive: !!body.exclusive,
    });
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (e) {
    console.error('Error creating job', e);
    res.status(500).json({ error: 'could not create job' });
  }
});

// PUT /api/jobs/:id - update an existing job
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // verify auth token and extract userId
    const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (!auth) return res.status(401).json({ error: 'authorization required' });
    const parts = auth.split(' ');
    const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
    const jwt = require('jsonwebtoken');
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    } catch (err) {
      return res.status(401).json({ error: 'invalid token' });
    }

    const userId = payload && (payload.userId || payload.id || payload._id);
    if (!userId) return res.status(401).json({ error: 'invalid token payload' });

    // ensure job exists and belongs to this user
    const existing = await Job.findById(id).lean();
    if (!existing) return res.status(404).json({ error: 'job not found' });
    if (!existing.createdBy || String(existing.createdBy) !== String(userId)) {
      return res.status(403).json({ error: 'forbidden - not job owner' });
    }

    const body = req.body || {};
    const update = { ...body };
    // prevent changing _id and createdBy
    delete update._id;
    delete update.createdBy;

    const updated = await Job.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'job not found after update' });
    res.json(updated);
  } catch (e) {
    console.error('Error updating job', e);
    res.status(500).json({ error: 'could not update job' });
  }
});

module.exports = router;
