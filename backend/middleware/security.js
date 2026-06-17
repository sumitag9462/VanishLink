const helmet = require('helmet');

const env = require('../config/env');

function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", 'data:', 'https:'],
        "connect-src": ["'self'", ...env.CORS_ORIGINS],
        "frame-ancestors": ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.isProduction
      ? { maxAge: 15552000, includeSubDomains: true, preload: true }
      : false,
  });
}

function corsOptions() {
  return {
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };
}

function noSqlSanitizer(req, res, next) {
  const hasUnsafeKey = (value) => {
    if (!value || typeof value !== 'object') return false;
    if (Array.isArray(value)) return value.some(hasUnsafeKey);
    return Object.keys(value).some((key) => {
      if (key.startsWith('$') || key.includes('.')) return true;
      return hasUnsafeKey(value[key]);
    });
  };

  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }
  next();
}

module.exports = {
  corsOptions,
  noSqlSanitizer,
  securityHeaders,
};
