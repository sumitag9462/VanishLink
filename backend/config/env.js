const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

function requireSecret(name, fallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return fallback;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction,
  PORT: Number(process.env.PORT || 5050),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vanish_link',
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  JWT_SECRET: requireSecret('JWT_SECRET', crypto.randomBytes(32).toString('hex')),
  HASH_SALT_SECRET: requireSecret('HASH_SALT_SECRET', crypto.randomBytes(32).toString('hex')),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  ADMIN_REGISTRATION_CODE: process.env.ADMIN_REGISTRATION_CODE || '',
};

module.exports = env;
