// backend/controllers/redirectController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const Link = require('../models/Link');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { queueWebhook } = require('../services/webhookQueueService');
const { analyzeTraffic } = require('../services/trafficAnomalyService');

// ---- helpers ----
function getDeviceType(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (/mobile/.test(ua)) return 'mobile';
  if (/tablet|ipad/.test(ua)) return 'tablet';
  if (/bot|crawler|spider/.test(ua)) return 'bot';
  return 'desktop';
}

function chooseConditionalTarget(link, deviceType, now, clickCount) {
  const rules = link.conditionalRedirect;
  if (!rules || !rules.enabled) return null;

  if (rules.deviceRules) {
    const d = (deviceType || '').toLowerCase();
    if (d === 'mobile' && rules.deviceRules.mobileUrl) return rules.deviceRules.mobileUrl;
    if (d === 'desktop' && rules.deviceRules.desktopUrl) return rules.deviceRules.desktopUrl;
    if (d === 'tablet' && rules.deviceRules.tabletUrl) return rules.deviceRules.tabletUrl;
    if (d === 'bot' && rules.deviceRules.botUrl) return rules.deviceRules.botUrl;
  }

  if (rules.dayTypeRules) {
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;
    if (isWeekend && rules.dayTypeRules.weekendUrl) return rules.dayTypeRules.weekendUrl;
    if (!isWeekend && rules.dayTypeRules.weekdayUrl) return rules.dayTypeRules.weekdayUrl;
  }

  if (Array.isArray(rules.timeOfDayRules)) {
    const hour = now.getHours();
    for (const win of rules.timeOfDayRules) {
      if (!win.url) continue;
      if (
        (win.startHour <= win.endHour && hour >= win.startHour && hour < win.endHour) ||
        (win.startHour > win.endHour && (hour >= win.startHour || hour < win.endHour))
      ) {
        return win.url;
      }
    }
  }

  if (Array.isArray(rules.clickRules)) {
    for (const r of rules.clickRules) {
      const min = typeof r.minClicks === 'number' ? r.minClicks : 0;
      const max = typeof r.maxClicks === 'number' ? r.maxClicks : null;
      if (clickCount >= min && (max === null || clickCount <= max)) {
        return r.url;
      }
    }
  }

  return null;
}

function sendWebhook(link, eventType, extra = {}) {
  const cfg = link.webhookConfig;
  if (!cfg || !cfg.enabled || !cfg.url) return;

  const payload = {
    event: eventType,
    slug: link.slug,
    clicks: link.clicks,
    occurredAt: new Date().toISOString(),
    ...extra,
  };

  queueWebhook(link._id, link.slug, eventType, payload, cfg.url).catch(err => console.error(err));
}

function getDailySalt() {
  const today = new Date().toISOString().slice(0, 10);
  const secret = process.env.HASH_SALT_SECRET || 'hawkins_secret_salt';
  return crypto.createHmac('sha256', secret).update(today).digest('hex');
}

function hashIP(ip) {
  if (!ip) return 'unknown';
  const salt = getDailySalt();
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

const { getCountryFromIP } = require('../middleware/geoFence');

async function logAnalyticsEvent(link, req, deviceType, visitorEmail = null, routingResult = {}) {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const rawIp = req.ip || req.connection.remoteAddress || '';
    let country = req.visitorCountry || await getCountryFromIP(rawIp);
    let hashedIp = hashIP(rawIp);
    
    // Phase 3: GDPR Compliance Mode
    if (link.gdprMode) {
      hashedIp = 'GDPR_ANONYMOUS';
      country = 'GDPR_ANONYMOUS';
    }

    // Phase 2: Traffic Anomaly & Bot Detection
    const { isBot } = await analyzeTraffic(link, hashedIp, userAgent);

    await AnalyticsEvent.create({
      link: link._id,
      slug: link.slug,
      ip: hashedIp,
      userAgent,
      deviceType: isBot ? 'bot' : deviceType,
      country,
      visitorEmail,
      destinationChosen: routingResult.destinationChosen || link.targetUrl,
      fallbackUsed: routingResult.fallbackUsed || false,
      botDetected: isBot,
      routingMode: link.routingMode || 'single',
    });

  } catch (err) {
    console.error('Failed to log analytics event:', err);
  }
}

exports.handleRedirect = async (req, res) => {
  try {
    const { slug } = req.params;
    const now = new Date();
    
    const rawIp = req.ip || req.connection.remoteAddress || '';
    const ipKey = `rate_limit:${rawIp}`;

    // Phase 3: Redis-backed distributed rate limiting (100 clicks / min)
    const redisService = require('../services/redisService');
    if (redisService.isConnected()) {
      const currentLimit = await redisService.getCache(ipKey) || 0;
      if (currentLimit > 100) {
        return res.status(429).send('VanishLink: Too many requests, rate limit exceeded.');
      }
      // Simplistic distributed rate limit tracking
      await redisService.setCache(ipKey, currentLimit + 1, 60);
    }

    // Phase 4: Custom Branded Domains (CNAME Support)
    const hostname = req.hostname;
    const isCustomDomain = hostname !== 'localhost' && !hostname.includes('vanish.link') && !hostname.includes('ngrok-free.app');
    
    let workspaceFilter = {};
    if (isCustomDomain) {
      const Workspace = require('../models/Workspace');
      const workspace = await Workspace.findOne({ customDomains: hostname });
      if (!workspace) {
        return res.status(404).send('VanishLink: Domain not configured or inactive.');
      }
      workspaceFilter = { workspaceId: workspace._id };
    }

    const query = {
      slug,
      status: 'active',
      ...workspaceFilter,
      $and: [
        { $or: [{ scheduleStart: null }, { scheduleStart: { $lte: now } }] },
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
        {
          $or: [
            { isOneTime: true, clicks: 0 },
            { isOneTime: { $ne: true }, maxClicks: 0 },
            { isOneTime: { $ne: true }, maxClicks: { $gt: 0 }, $expr: { $lt: ["$clicks", "$maxClicks"] } }
          ]
        }
      ]
    };

    const link = await Link.findOneAndUpdate(query, { $inc: { clicks: 1 } }, { new: true });

    if (link) {
      // Password check
      if (link.password) {
        const token = req.query.token;
        if (!token) return res.status(403).send('VanishLink: Password verification required');
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
          if (decoded.slug !== link.slug || !decoded.verified) return res.status(403).send('VanishLink: Invalid verification token');
        } catch (err) {
          return res.status(403).send('VanishLink: Session expired or invalid');
        }
      }

      let visitorEmail = null;
      // OTP check
      if (link.otpEnabled) {
        const otpToken = req.query.otpToken;
        if (!otpToken) return res.status(403).send('VanishLink: OTP verification required');
        try {
          const decoded = jwt.verify(otpToken, process.env.JWT_SECRET || 'fallback_secret');
          if (decoded.slug !== link.slug || !decoded.verifiedOtp) return res.status(403).send('VanishLink: Invalid OTP verification token');
          visitorEmail = decoded.email;
        } catch (err) {
          return res.status(403).send('VanishLink: Session expired or invalid');
        }
      }

      const limit = link.isOneTime ? 1 : link.maxClicks || 0;
      if (limit > 0 && link.clicks >= limit) {
        link.status = 'expired';
        await link.save();
        sendWebhook(link, 'expired', { reason: link.isOneTime ? 'one_time_complete' : 'max_clicks_reached' });
      }

      if (link.clicks === 1) sendWebhook(link, 'first_click');

      const userAgent = req.headers['user-agent'] || '';
      const deviceType = getDeviceType(userAgent);
      
      const parser = require('ua-parser-js');
      const uaParsed = parser(userAgent);
      const osName = (uaParsed.os.name || '').toLowerCase();
      
      let finalTarget = link.targetUrl;
      const conditional = chooseConditionalTarget(link, deviceType, now, link.clicks);
      if (conditional) {
        finalTarget = conditional;
      } else {
        // Phase 3: Mobile Deep Linking Fallbacks
        if (link.iosUrl && (osName === 'ios')) {
          finalTarget = link.iosUrl;
        } else if (link.androidUrl && (osName === 'android')) {
          finalTarget = link.androidUrl;
        }
      }

      // Phase 2: A/B Testing & Link Rotator
      if (!conditional && link.routingMode && link.routingMode !== 'single' && link.destinations && link.destinations.length > 0) {
        if (link.routingMode === 'weighted') {
          const totalWeight = link.destinations.reduce((acc, d) => acc + d.weight, 0);
          let random = Math.random() * totalWeight;
          for (const d of link.destinations) {
            random -= d.weight;
            if (random <= 0) {
              finalTarget = d.url;
              break;
            }
          }
        } else if (link.routingMode === 'random') {
          const index = Math.floor(Math.random() * link.destinations.length);
          finalTarget = link.destinations[index].url;
        } else if (link.routingMode === 'round-robin' || link.routingMode === 'sequential') {
          const index = link.currentRouteIndex % link.destinations.length;
          finalTarget = link.destinations[index].url;
          // Note: we just updated the link with findOneAndUpdate earlier, so we save it again here
          link.currentRouteIndex = index + 1;
          await link.save();
        }
      }

      const routingResult = {
        destinationChosen: finalTarget,
        fallbackUsed: false
      };

      logAnalyticsEvent(link, req, deviceType, visitorEmail, routingResult).catch(err => console.error(err));

      // Emit live analytics event to dashboard
      try {
        const io = require('../sockets/socketManager').getIO();
        io.to('admin-dashboard').emit('link-click', {
          slug: link.slug,
          country: req.visitorCountry || await getCountryFromIP(req.ip || req.connection.remoteAddress || ''),
          browser: userAgent,
          device: deviceType,
          timestamp: now,
          visitorEmail: visitorEmail
        });
      } catch (err) {
        console.error('Live analytics emit failed:', err);
      }

      return res.redirect(finalTarget);
    }

    // Diagnostic fallback checks
    const linkCheck = await Link.findOne({ slug });
    if (!linkCheck) return res.status(404).send('VanishLink: Not found');

    const handleFallback = async (l, reason) => {
      if (l.fallbackUrl) {
        // Log fallback usage
        const routingResult = { destinationChosen: l.fallbackUrl, fallbackUsed: true };
        const userAgent = req.headers['user-agent'] || '';
        const deviceType = getDeviceType(userAgent);
        logAnalyticsEvent(l, req, deviceType, null, routingResult).catch(err => console.error(err));
        return res.redirect(l.fallbackUrl);
      }
      return res.status(410).send(`VanishLink: ${reason}`);
    };

    if (linkCheck.status === 'expired' || linkCheck.status === 'destroyed') return handleFallback(linkCheck, 'Expired');
    if (linkCheck.expiresAt && now > linkCheck.expiresAt) {
      if (linkCheck.status !== 'expired') {
        linkCheck.status = 'expired';
        await linkCheck.save();
        sendWebhook(linkCheck, 'expired', { reason: 'time_expired' });
      }
      return handleFallback(linkCheck, 'Expired');
    }
    if (linkCheck.scheduleStart && now < linkCheck.scheduleStart) return res.status(403).send('VanishLink: Not active yet');
    
    const limitCheck = linkCheck.isOneTime ? 1 : linkCheck.maxClicks || 0;
    if (limitCheck > 0 && linkCheck.clicks >= limitCheck) return handleFallback(linkCheck, 'Click limit reached');

    return handleFallback(linkCheck, 'Click limit reached or link unavailable');
  } catch (err) {
    console.error(err);
    res.status(500).send('VanishLink: Internal server error');
  }
};
