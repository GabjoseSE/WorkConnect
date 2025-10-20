const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages/conversations?userId=...
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const convos = await Conversation.find({ participants: userId }).sort({ updatedAt: -1 }).limit(50).lean();
    res.json({ conversations: convos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/messages/:conversationId
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// POST /api/messages/send
router.post('/send', async (req, res) => {
  try {
    const { conversationId, from, to, body, title } = req.body;
    if (!from || !body) return res.status(400).json({ error: 'from and body required' });

    let convo = null;
    if (conversationId) convo = await Conversation.findById(conversationId);
    if (!convo) {
      // create conversation with participants [from,to]
      convo = new Conversation({ title: title || '', participants: [from, to].filter(Boolean) });
      await convo.save();
    }

    const msg = new Message({ conversationId: convo._id, from, to, body });
    await msg.save();

    convo.lastMessage = body;
    convo.updatedAt = new Date();
    await convo.save();

    res.json({ conversation: convo, message: msg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
