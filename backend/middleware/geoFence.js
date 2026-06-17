// server/middleware/geoFence.js
const Link = require('../models/Link');
const redisService = require('../services/redisService');

async function getCountryFromIP(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return 'Local';
  const cleanIp = ip.replace('::ffff:', '');
  if (
    cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.') || 
    cleanIp.startsWith('172.16.') || cleanIp.startsWith('172.17.') || 
    cleanIp.startsWith('172.18.') || cleanIp.startsWith('172.19.') ||
    cleanIp.startsWith('172.2') || cleanIp.startsWith('172.30.') ||
    cleanIp.startsWith('172.31.')
  ) {
    return 'Local';
  }
  try {
    const cacheKey = `geo:${cleanIp}`;
    const cached = await redisService.getCache(cacheKey);
    if (cached) return cached;

    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country`);
    const data = await response.json();
    if (data.status === 'success' && data.country) {
      await redisService.setCache(cacheKey, data.country, 86400); // cache for 24 hours
      return data.country;
    }
  } catch (err) {
    // Ignore error
  }
  return 'Unknown';
}

exports.geoFence = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    // We do a lightweight pre-check. If it's blocked, we don't proceed to atomic increment.
    const link = await Link.findOne({ slug }).select('geoFenceEnabled allowedCountries blockedCountries');
    
    if (!link) {
      return next(); // Let redirect controller handle 404
    }

    if (link.geoFenceEnabled) {
      const rawIp = req.ip || req.connection.remoteAddress || '';
      const country = await getCountryFromIP(rawIp);
      
      req.visitorCountry = country; // Store for controller

      const { allowedCountries, blockedCountries } = link;

      // Rule 1: Explicitly blocked
      if (blockedCountries && blockedCountries.length > 0 && blockedCountries.includes(country)) {
        return res.status(403).send('VanishLink: Access Denied for Your Region');
      }

      // Rule 2: Explicit whitelist
      if (allowedCountries && allowedCountries.length > 0 && !allowedCountries.includes(country)) {
        return res.status(403).send('VanishLink: Access Denied for Your Region');
      }
    }

    next();
  } catch (err) {
    console.error('GeoFence Middleware Error:', err);
    next(); // Fail open for safety
  }
};

exports.getCountryFromIP = getCountryFromIP;
