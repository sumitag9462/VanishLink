const { createClient } = require('redis');

let redisClient = null;
let isConnected = false;

let hasLoggedError = false;

// Fallback in-memory cache if Redis is unavailable
const memoryCache = new Map();

const initRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            // Stop reconnecting after 2 failed retries
            return new Error('Redis connection failed after retries');
          }
          return 500; // retry after 500ms
        }
      }
    });

    redisClient.on('error', (err) => {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connection failed')) {
        if (!hasLoggedError) {
          console.warn('⚠️ Redis is unreachable. Using in-memory fallback for caching.');
          hasLoggedError = true;
        }
      } else {
        console.error('Redis Client Error:', err.message || err);
      }
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis successfully');
      isConnected = true;
      hasLoggedError = false;
    });

    await redisClient.connect();
  } catch (err) {
    if (!hasLoggedError) {
      console.warn('⚠️ Failed to initialize Redis. Using in-memory fallback.', err.message);
      hasLoggedError = true;
    }
    isConnected = false;
  }
};

const getCache = async (key) => {
  if (isConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis GET Error:', err);
      return memoryCache.get(key) || null;
    }
  }
  return memoryCache.get(key) || null;
};

const setCache = async (key, value, expirationSeconds = 3600) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: expirationSeconds
      });
      return;
    } catch (err) {
      console.error('Redis SET Error:', err);
    }
  }
  memoryCache.set(key, value);
  // Simple memory cleanup for the fallback
  setTimeout(() => memoryCache.delete(key), expirationSeconds * 1000);
};

const clearCache = async (key) => {
  if (isConnected && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.error('Redis DEL Error:', err);
    }
  }
  memoryCache.delete(key);
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  clearCache,
  isConnected: () => isConnected
};
