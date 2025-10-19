const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// GET /api/jobs - list jobs (most recent first)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 }).lean();
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

module.exports = router;
