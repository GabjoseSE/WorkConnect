const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
let Verification;
try { Verification = require('../models/Verification'); } catch (e) { Verification = null; }

const inMemory = new Map();
function isDbConnected() { return mongoose && mongoose.connection && mongoose.connection.readyState === 1 && Verification; }

// helpers to send via providers if configured
const sendGridApiKey = process.env.SENDGRID_API_KEY;
const twilioSid = process.env.TWILIO_SID;
const twilioToken = process.env.TWILIO_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;

let sendGrid;
if (sendGridApiKey) {
  try { sendGrid = require('@sendgrid/mail'); sendGrid.setApiKey(sendGridApiKey); } catch (e) { sendGrid = null; }
}

let twilioClient;
if (twilioSid && twilioToken) {
  try { const tw = require('twilio'); twilioClient = new tw(twilioSid, twilioToken); } catch (e) { twilioClient = null; }
}

function generateCode() { return Math.floor(100000 + Math.random() * 900000).toString(); }

// POST /api/verify/send { contact, method } -> { success }
router.post('/send', async (req, res) => {
  try {
    const { contact, method } = req.body;
    if (!contact || !method) return res.status(400).json({ error: 'contact and method required' });
    const code = generateCode();
    const ttl = parseInt(process.env.VERIFY_TTL_SECONDS || '300', 10); // default 5m
    const expiresAt = new Date(Date.now() + ttl * 1000);

    if (!isDbConnected()) {
      inMemory.set(contact, { code, method, expiresAt });
    } else {
      await Verification.create({ contact, method, code, expiresAt });
    }

    // send via provider when available
    if (method === 'email' && sendGrid) {
      await sendGrid.send({ to: contact, from: process.env.SENDGRID_FROM || 'no-reply@example.com', subject: 'Your verification code', text: `Your code is ${code}` });
      return res.json({ success: true });
    }

    if (method === 'sms' && twilioClient && twilioFrom) {
      await twilioClient.messages.create({ body: `Your code is ${code}`, from: twilioFrom, to: contact });
      return res.json({ success: true });
    }

  // fallback: log and return success (dev)
  console.log('Verification code for', contact, code);
  // In development, include the code in the response so local testing can proceed
  const debugMode = process.env.NODE_ENV !== 'production' || process.env.DEBUG_VERIFY === '1';
  const resp = { success: true, debug: debugMode };
  if (debugMode) resp.code = code;
  return res.json(resp);
  } catch (err) {
    console.error('verify/send error', err);
    res.status(500).json({ error: 'failed to send code' });
  }
});

// POST /api/verify/verify { contact, code } -> { valid }
router.post('/verify', async (req, res) => {
  try {
    const { contact, code } = req.body;
    if (!contact || !code) return res.status(400).json({ error: 'contact and code required' });

    if (!isDbConnected()) {
      const rec = inMemory.get(contact);
      if (!rec) return res.status(400).json({ valid: false });
      if (new Date() > rec.expiresAt) return res.status(400).json({ valid: false, error: 'expired' });
      if (rec.code !== code) return res.status(400).json({ valid: false });
      inMemory.delete(contact);
      return res.json({ valid: true });
    }

    const rec = await Verification.findOne({ contact, code, used: false }).sort({ createdAt: -1 });
    if (!rec) return res.status(400).json({ valid: false });
    if (new Date() > rec.expiresAt) return res.status(400).json({ valid: false, error: 'expired' });
    rec.used = true; await rec.save();
    return res.json({ valid: true });
  } catch (err) {
    console.error('verify/verify error', err);
    res.status(500).json({ error: 'verify failed' });
  }
});

module.exports = router;
