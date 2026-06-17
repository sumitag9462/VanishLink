const TrafficAnomaly = require('../models/TrafficAnomaly');

// Store simple sliding windows in memory (for large scale, use Redis)
// structure: { [ipHash]: [timestamp1, timestamp2, ...] }
const clickHistory = {};
const WINDOW_MS = 3000; // 3 seconds
const MAX_CLICKS = 20; // 20 clicks in 3 seconds

exports.analyzeTraffic = async (link, ipHash, userAgent) => {
  const now = Date.now();
  
  if (!clickHistory[ipHash]) {
    clickHistory[ipHash] = [];
  }
  
  // Clean up old clicks
  clickHistory[ipHash] = clickHistory[ipHash].filter(ts => now - ts < WINDOW_MS);
  
  // Add current click
  clickHistory[ipHash].push(now);
  
  const recentClicks = clickHistory[ipHash].length;
  let isBot = false;
  let riskScore = 0;
  let reason = '';
  
  // 1. Rate Limiting / Rapid clicking anomaly
  if (recentClicks > MAX_CLICKS) {
    isBot = true;
    riskScore = 95;
    reason = `Rapid clicking: ${recentClicks} clicks in ${WINDOW_MS/1000}s`;
  }
  
  // 2. Simple User Agent heuristics
  const ua = (userAgent || '').toLowerCase();
  if (/headless|puppeteer|selenium|playwright/.test(ua)) {
    isBot = true;
    riskScore = 100;
    reason = 'Headless browser fingerprint detected';
  }

  if (isBot) {
    try {
      await TrafficAnomaly.create({
        linkId: link._id,
        slug: link.slug,
        ipHash,
        fingerprint: userAgent || 'Unknown',
        isBot,
        riskScore,
        reason
      });

      // Emit to Socket.IO admin dashboard
      try {
        const { getIO } = require('../sockets/socketManager');
        const io = getIO();
        io.to('admin-dashboard').emit('traffic-anomaly', {
          slug: link.slug,
          ipHash,
          reason,
          riskScore,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Failed to emit traffic anomaly to sockets');
      }

    } catch (err) {
      console.error('Failed to save traffic anomaly:', err);
    }
  }

  return { isBot, riskScore, reason };
};
