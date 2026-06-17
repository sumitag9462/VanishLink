const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const crypto = require('crypto');

exports.apiAuth = (requiredScope = null) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
      }

      const token = authHeader.split(' ')[1];
      const keyHash = crypto.createHash('sha256').update(token).digest('hex');

      const apiKey = await ApiKey.findOne({ keyHash, isActive: true }).populate('user');
      
      if (!apiKey) {
        return res.status(401).json({ message: 'Invalid API Key' });
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return res.status(401).json({ message: 'API Key has expired' });
      }

      if (requiredScope && !apiKey.scopes.includes(requiredScope)) {
        return res.status(403).json({ message: `Missing required scope: ${requiredScope}` });
      }

      // Update last used asynchronously
      apiKey.lastUsedAt = new Date();
      apiKey.save().catch(err => console.error('Failed to update API key lastUsedAt:', err));

      // Attach user and workspace context
      req.user = apiKey.user;
      if (apiKey.workspaceId) {
        req.workspaceId = apiKey.workspaceId;
      }
      req.apiKey = apiKey;

      next();
    } catch (err) {
      console.error('API Auth Error:', err);
      res.status(500).json({ message: 'Internal server error during authentication' });
    }
  };
};
