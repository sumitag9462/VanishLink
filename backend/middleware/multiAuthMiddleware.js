const { authenticate } = require('../routes/authRoutes');
const { apiAuth } = require('./apiAuthMiddleware');

exports.requireAuthOrApiKey = (requiredScope = null) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    
    // If it's a Bearer token that doesn't look like a JWT (i.e. starts with dl_), use apiAuth
    if (authHeader.startsWith('Bearer dl_')) {
      return apiAuth(requiredScope)(req, res, next);
    }
    
    // Otherwise, fallback to the standard session JWT auth
    authenticate(req, res, next);
  };
};
