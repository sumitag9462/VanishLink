// server/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const AnalyticsEvent = require('../models/AnalyticsEvent');

// GET /api/analytics
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Get user's email from authenticated request
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get only user's links + analytics events for those links
    const links = await Link.find({ ownerEmail: userEmail });
    
    // Get link IDs to filter analytics events
    const linkIds = links.map(link => link._id);
    
    const events = await AnalyticsEvent.find({ 
      link: { $in: linkIds },
      createdAt: { $gte: sevenDaysAgo } 
    });

    // ----- totals from links -----
    let totalClicks = 0;
    let activeLinks = 0;

    links.forEach((link) => {
      const clicks = link.clicks ?? link.clickCount ?? 0;
      totalClicks += clicks;

      const isExpired =
        link.status === 'expired' ||
        (link.expiresAt && now > link.expiresAt);

      if (!isExpired) {
        activeLinks += 1;
      }
    });

    // ----- device + geo info from events -----
    const totalEvents = events.length;
    let mobileCount = 0;
    const countryCounts = {};
    const dayBuckets = {};

    events.forEach((ev) => {
      if (ev.deviceType === 'mobile') mobileCount++;

      const country = ev.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      const dayKey = ev.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      dayBuckets[dayKey] = (dayBuckets[dayKey] || 0) + 1;
    });

    const mobile =
      totalEvents > 0 ? Math.round((mobileCount / totalEvents) * 100) : 0;

    let topLocation = 'Unknown';
    let topCount = 0;
    Object.entries(countryCounts).forEach(([country, count]) => {
      if (count > topCount) {
        topCount = count;
        topLocation = country;
      }
    });

    const timeline = Object.keys(dayBuckets)
      .sort()
      .map((date) => ({
        date,
        clicks: dayBuckets[date],
      }));

    const geo = Object.entries(countryCounts).map(([country, clicks]) => ({
      country,
      clicks,
    }));

    const TrafficAnomaly = require('../models/TrafficAnomaly');
    const anomaliesCount = await TrafficAnomaly.countDocuments({ linkId: { $in: linkIds } });
    const botClicks = await AnalyticsEvent.countDocuments({
      link: { $in: linkIds },
      botDetected: true
    });

    res.json({
      total: totalClicks,
      activeLinks,
      mobile,
      topLocation,
      timeline,
      geo,
      botClicks,
      anomaliesCount
    });
  } catch (err) {
    console.error('Error in GET /api/analytics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/analytics/webhooks
router.get('/webhooks', async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const links = await Link.find({ ownerEmail: userEmail });
    const linkIds = links.map(link => link._id);

    const { WebhookQueue } = require('../models/WebhookQueue'); // Or just define it
    const mongoose = require('mongoose');
    
    // WebhookQueue model might not be exported this way, let's just require it properly
    const Webhook = require('../models/WebhookQueue');

    const webhooks = await Webhook.find({ linkId: { $in: linkIds } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('linkId', 'slug title');

    res.json(webhooks);
  } catch (err) {
    console.error('Error fetching webhooks:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const exportController = require('../controllers/exportController');

// GET /api/analytics/insights — MUST be before /:slug routes
// AI-interpreted insights: peak times, unusual spikes, predicted link exhaustion
router.get('/insights', async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const links = await Link.find({ ownerEmail: userEmail });
    const linkIds = links.map(link => link._id);

    // Get events for last 7 days and previous 7 days for comparison
    const [recentEvents, previousEvents] = await Promise.all([
      AnalyticsEvent.find({ link: { $in: linkIds }, createdAt: { $gte: sevenDaysAgo } }),
      AnalyticsEvent.find({ link: { $in: linkIds }, createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
    ]);

    const insights = [];

    // --- 1. Peak Hour Analysis ---
    const hourBuckets = new Array(24).fill(0);
    recentEvents.forEach(ev => {
      const hour = new Date(ev.createdAt).getHours();
      hourBuckets[hour]++;
    });
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakClicks = hourBuckets[peakHour];
    if (recentEvents.length > 0) {
      const formatHour = (h) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = h % 12 || 12;
        return `${display}${ampm}`;
      };
      insights.push({
        id: 'peak_hour',
        type: 'info',
        icon: 'clock',
        title: 'Peak Traffic Hour',
        description: `Your links receive the most traffic between ${formatHour(peakHour)}–${formatHour((peakHour + 1) % 24)}, with ${peakClicks} clicks this week.`,
        metric: formatHour(peakHour),
        metricLabel: 'Peak Hour',
      });
    }

    // --- 2. Week-over-Week Spike Detection ---
    const recentTotal = recentEvents.length;
    const previousTotal = previousEvents.length;
    if (previousTotal > 0) {
      const changePercent = Math.round(((recentTotal - previousTotal) / previousTotal) * 100);
      if (Math.abs(changePercent) >= 20) {
        insights.push({
          id: 'traffic_trend',
          type: changePercent > 0 ? 'warning' : 'info',
          icon: changePercent > 0 ? 'trending-up' : 'trending-down',
          title: changePercent > 0 ? 'Unusual Traffic Spike Detected' : 'Traffic Decline Noticed',
          description: changePercent > 0
            ? `Traffic is up ${changePercent}% compared to last week (${previousTotal} → ${recentTotal} clicks). Investigate if this is organic growth or a potential bot attack.`
            : `Traffic decreased by ${Math.abs(changePercent)}% compared to last week (${previousTotal} → ${recentTotal} clicks). Consider promoting your links or checking for broken URLs.`,
          metric: `${changePercent > 0 ? '+' : ''}${changePercent}%`,
          metricLabel: 'Week-over-Week',
        });
      }
    }

    // --- 3. Link Exhaustion Prediction ---
    const linksNearingLimit = [];
    links.forEach(link => {
      const limit = link.isOneTime ? 1 : (link.maxClicks || 0);
      if (limit > 0 && link.status === 'active') {
        const remaining = limit - (link.clicks || 0);
        const percentUsed = Math.round(((link.clicks || 0) / limit) * 100);
        if (percentUsed >= 60) {
          // Predict exhaustion based on recent click rate
          const linkEvents = recentEvents.filter(ev => ev.link.toString() === link._id.toString());
          const dailyRate = linkEvents.length / 7;
          const daysRemaining = dailyRate > 0 ? Math.ceil(remaining / dailyRate) : null;

          linksNearingLimit.push({
            slug: link.slug,
            title: link.title || link.slug,
            remaining,
            percentUsed,
            daysRemaining,
          });
        }
      }
    });

    if (linksNearingLimit.length > 0) {
      const topLink = linksNearingLimit.sort((a, b) => b.percentUsed - a.percentUsed)[0];
      const exhaustionText = topLink.daysRemaining !== null
        ? `Predicted exhaustion in ~${topLink.daysRemaining} day${topLink.daysRemaining !== 1 ? 's' : ''} at current velocity.`
        : `Exhaustion timing cannot be predicted (no recent clicks).`;

      insights.push({
        id: 'link_exhaustion',
        type: 'critical',
        icon: 'alert-triangle',
        title: 'Link Nearing Click Limit',
        description: `"${topLink.title}" has used ${topLink.percentUsed}% of its allowed clicks (${topLink.remaining} remaining). ${exhaustionText}`,
        metric: `${topLink.percentUsed}%`,
        metricLabel: 'Consumed',
        affectedLinks: linksNearingLimit.length,
      });
    }

    // --- 4. Geographic Concentration ---
    const countryCounts = {};
    recentEvents.forEach(ev => {
      const country = ev.country || 'Unknown';
      if (country !== 'Unknown' && country !== 'GDPR_ANONYMOUS') {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });
    const geoEntries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
    if (geoEntries.length > 0 && recentEvents.length > 0) {
      const topCountry = geoEntries[0];
      const topPercent = Math.round((topCountry[1] / recentEvents.length) * 100);
      if (topPercent >= 50) {
        insights.push({
          id: 'geo_concentration',
          type: 'info',
          icon: 'globe',
          title: 'High Geographic Concentration',
          description: `${topPercent}% of your traffic originates from ${topCountry[0]}. Consider geo-fencing or localized redirects for better targeting.`,
          metric: `${topPercent}%`,
          metricLabel: topCountry[0],
        });
      }
    }

    // --- 5. Bot Activity Warning ---
    const botCount = recentEvents.filter(ev => ev.botDetected).length;
    if (recentEvents.length > 0) {
      const botPercent = Math.round((botCount / recentEvents.length) * 100);
      if (botPercent >= 10) {
        insights.push({
          id: 'bot_activity',
          type: 'warning',
          icon: 'bot',
          title: 'Elevated Bot Activity',
          description: `${botPercent}% of your clicks this week were flagged as bots (${botCount} out of ${recentEvents.length}). Enable stricter rate limiting or CAPTCHA to protect your links.`,
          metric: `${botPercent}%`,
          metricLabel: 'Bot Traffic',
        });
      }
    }

    // --- 6. Device Trend ---
    let mobileCount = 0;
    let desktopCount = 0;
    recentEvents.forEach(ev => {
      if (ev.deviceType === 'mobile') mobileCount++;
      if (ev.deviceType === 'desktop') desktopCount++;
    });
    if (recentEvents.length > 5) {
      const mobilePercent = Math.round((mobileCount / recentEvents.length) * 100);
      if (mobilePercent >= 65) {
        insights.push({
          id: 'mobile_dominant',
          type: 'info',
          icon: 'smartphone',
          title: 'Mobile-Dominant Audience',
          description: `${mobilePercent}% of visitors use mobile devices. Consider enabling mobile deep-linking and optimizing your destinations for mobile.`,
          metric: `${mobilePercent}%`,
          metricLabel: 'Mobile',
        });
      } else if (mobilePercent <= 20 && desktopCount > 0) {
        insights.push({
          id: 'desktop_dominant',
          type: 'info',
          icon: 'monitor',
          title: 'Desktop-Heavy Audience',
          description: `Only ${mobilePercent}% of visitors use mobile. Your audience is primarily desktop-based — consider embedding links in emails or documents rather than social media.`,
          metric: `${100 - mobilePercent}%`,
          metricLabel: 'Desktop',
        });
      }
    }

    // --- Default when no insights ---
    if (insights.length === 0) {
      insights.push({
        id: 'no_data',
        type: 'info',
        icon: 'sparkles',
        title: 'Gathering Intelligence',
        description: 'Not enough traffic data yet to generate AI insights. Share your links and check back once clicks start flowing in.',
        metric: '—',
        metricLabel: 'Waiting',
      });
    }

    res.json({ insights, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Error in GET /api/analytics/insights:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/analytics/:slug/export — AFTER /insights to avoid route conflict
router.get('/:slug/export', exportController.exportAnalyticsCSV);

// GET /api/analytics/ghost
router.get('/ghost', async (req, res) => {
  try {
    const GhostVisitor = require('../models/GhostVisitor');
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ message: 'Unauthorized' });

    const links = await Link.find({ ownerEmail: userEmail, 'ghostMode.enabled': true });
    const linkIds = links.map(l => l._id);

    const visitors = await GhostVisitor.find({ linkId: { $in: linkIds } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('linkId', 'slug title ghostMode');

    // Calculate aggregated stats
    const totalRedirects = visitors.length;
    let highRiskCount = 0;
    let honeypotHits = 0;
    const countries = {};
    const devices = {};
    const referrers = {};

    visitors.forEach(v => {
      if (v.riskScore >= 70) highRiskCount++;
      if (v.isHoneypot) honeypotHits++;
      
      countries[v.country] = (countries[v.country] || 0) + 1;
      devices[v.device] = (devices[v.device] || 0) + 1;
      referrers[v.referrer] = (referrers[v.referrer] || 0) + 1;
    });

    const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topDevices = Object.entries(devices).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topReferrers = Object.entries(referrers).sort((a, b) => b[1] - a[1]).slice(0, 5);

    res.json({
      totalRedirects,
      highRiskCount,
      honeypotHits,
      topCountries,
      topDevices,
      topReferrers,
      recentVisitors: visitors
    });
  } catch (err) {
    console.error('Error fetching ghost analytics:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
