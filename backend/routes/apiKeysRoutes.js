const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const { authenticate } = require('./authRoutes');

// Protect these routes with normal user JWT session
router.use(authenticate);

// GET /api/keys
router.get('/', async (req, res) => {
  try {
    const keys = await ApiKey.find({ user: req.user.sub || req.user._id }).select('-keyHash');
    res.json(keys);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/keys
router.post('/', async (req, res) => {
  try {
    const { name, scopes, workspaceId } = req.body;
    
    // Generate a secure random API key
    const rawKey = 'dl_' + crypto.randomBytes(32).toString('hex');
    const keyPrefix = rawKey.substring(0, 8);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = new ApiKey({
      keyPrefix,
      keyHash,
      user: req.user.sub || req.user._id,
      name: name || 'Default Key',
      scopes: scopes || ['links:read', 'links:write'],
      workspaceId: workspaceId || null
    });

    await apiKey.save();

    // Only return the raw key ONCE upon creation
    res.status(201).json({
      _id: apiKey._id,
      name: apiKey.name,
      key: rawKey,
      scopes: apiKey.scopes
    });
  } catch (err) {
    console.error('Error creating API key:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/keys/:id
router.delete('/:id', async (req, res) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({ _id: req.params.id, user: req.user.sub || req.user._id });
    if (!apiKey) return res.status(404).json({ message: 'API key not found' });
    
    res.json({ message: 'API key revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
