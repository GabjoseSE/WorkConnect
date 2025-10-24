const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/messages/conversations?userId=...
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    // By default return non-archived conversations for the user. If ?archived=true is provided, return archived convos instead.
    const archived = req.query.archived === 'true';
    const baseQuery = { participants: userId };
    if (archived) {
      baseQuery.archivedBy = userId;
    } else {
      baseQuery.archivedBy = { $ne: userId };
    }
    const convos = await Conversation.find(baseQuery).sort({ updatedAt: -1 }).limit(200).lean();
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

// POST /api/messages/start
router.post('/start', async (req, res) => {
  try {
    const { from, to, title } = req.body;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });

    // Try to find an existing conversation with these participants
    let convo = await Conversation.findOne({
      participants: { $all: [from, to] },
    });

    // If none exists, create it
    if (!convo) {
      convo = new Conversation({
        title: title || '',
        participants: [from, to],
      });
      await convo.save();
    }

    res.json({ conversationId: convo._id, conversation: convo });
  } catch (err) {
    console.error('Error starting conversation:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// PATCH /api/messages/conversations/:id  -- toggle archived state for requesting user
router.patch('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body; // boolean
    const userId = req.body.userId || req.query.userId;
    if (typeof archived === 'undefined') return res.status(400).json({ error: 'archived boolean required' });
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ error: 'conversation not found' });

    const idx = convo.archivedBy ? convo.archivedBy.findIndex(a => String(a) === String(userId)) : -1;
    if (archived) {
      if (idx === -1) {
        convo.archivedBy = convo.archivedBy || [];
        convo.archivedBy.push(userId);
      }
    } else {
      if (idx >= 0) {
        convo.archivedBy.splice(idx, 1);
      }
    }
    await convo.save();
    res.json({ conversation: convo });
  } catch (err) {
    console.error('Error archiving conversation:', err);
    res.status(500).json({ error: 'server error' });
  }
});

// DELETE /api/messages/conversations/:id  -- delete conversation and its messages
router.delete('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ error: 'conversation not found' });

    // remove messages belonging to this conversation
    await Message.deleteMany({ conversationId: convo._id });
    await Conversation.deleteOne({ _id: convo._id });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ error: 'server error' });
  }
});


module.exports = router;
