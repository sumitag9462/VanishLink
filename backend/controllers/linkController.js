const Link = require('../models/Link');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { sanitizeLink, sanitizeLinks } = require('../utils/linkSanitizer');
const { basicUrlSafetyCheck } = require('../scripts/urlSafety');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAiSummary } = require('../services/aiSummaryService');
const OTP = require('../models/OTP');
const { sendOtpEmail } = require('../services/emailService');
const { scanUrl } = require('../services/securityScannerService');
const { createLinkSchema } = require('../utils/validators');
const redisService = require('../services/redisService');

// GET /api/links/public
exports.getPublicLinks = async (req, res) => {
  try {
    const cacheKey = 'public_links_metadata';
    const cachedLinks = await redisService.getCache(cacheKey);
    if (cachedLinks) {
      return res.json(cachedLinks);
    }

    const links = await Link.find({ visibility: 'public' })
      .sort({ createdAt: -1 })
      .limit(500)
      .select('_id slug targetUrl title clicks createdAt ownerEmail password showPreview isOneTime maxClicks collection status');

    const sanitized = sanitizeLinks(links);
    await redisService.setCache(cacheKey, sanitized, 300); // 5 minutes cache
    res.json(sanitized);
  } catch (err) {
    console.error('Error fetching public links:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/links
exports.getUserLinks = async (req, res) => {
  try {
    const query = { ownerEmail: req.user.email };
    const links = await Link.find(query).sort({ createdAt: -1 });
    res.json(sanitizeLinks(links));
  } catch (err) {
    console.error('Error fetching links:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/links/:slug/verify-password
exports.verifyPassword = async (req, res) => {
  try {
    const { slug } = req.params;
    const { password } = req.body;
    const link = await Link.findOne({ slug });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    if (!link.password) {
      return res.json({ success: true });
    }
    const isMatch = await bcrypt.compare(password, link.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    const token = jwt.sign({ slug, verified: true }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '5m' });
    return res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /api/links/:slug
exports.getLinkBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug });
    if (!link) {
      return res.status(404).json({ status: 'not_found' });
    }

    const now = new Date();

    // 👻 Ghost Mode Validation
    if (link.ghostMode && link.ghostMode.enabled) {
      const tokenQuery = req.query.k || req.query.token || req.query.t;
      let isGhostAccessGranted = false;

      if (tokenQuery && link.ghostMode.secretToken) {
        // Compare hash (constant time comparison via bcrypt)
        isGhostAccessGranted = await bcrypt.compare(tokenQuery, link.ghostMode.secretToken);
      }

      if (!isGhostAccessGranted) {
        // Log unauthorized attempt
        const GhostVisitor = require('../models/GhostVisitor');
        await GhostVisitor.create({
          linkId: link._id,
          slug: link.slug,
          ipHash: require('crypto').createHash('sha256').update(req.ip || 'unknown').digest('hex'),
          country: req.headers['cf-ipcountry'] || 'Unknown',
          browser: req.headers['user-agent'] || 'Unknown',
          decoyUsed: link.ghostMode.decoyUrl || 'https://google.com',
          isHoneypot: link.ghostMode.honeypotMode || false,
        });

        // Increment failed attempts and handle self-destruct
        link.ghostMode.failedAttempts = (link.ghostMode.failedAttempts || 0) + 1;
        if (link.ghostMode.destroyAfterAttempts && link.ghostMode.failedAttempts >= link.ghostMode.destroyAfterAttempts) {
          // Silent Self Destruct
          await Link.findByIdAndDelete(link._id);
          // Wait, if we delete the link, the user won't get redirected, they get 404!
          // Actually, we can delete it but still serve the decoy for this request.
        } else {
          await link.save();
        }

        // 🛡️ Plausible Deniability - Send to Decoy
        return res.status(200).json({ 
          status: 'active', 
          link: { 
            targetUrl: link.ghostMode.decoyUrl || 'https://google.com',
            hasPassword: false,
            otpEnabled: false,
            showPreview: false,
            isGhostHoneypot: link.ghostMode.honeypotMode // Optional flag if frontend renders honeypot
          } 
        });
      }
    }

    if (link.expiresAt && now > link.expiresAt) {
      if (link.status !== 'expired') {
        link.status = 'expired';
        await link.save();
      }
      return res.status(200).json({ status: 'expired', reason: 'Link has self-destructed.' });
    }

    const effectiveLimit = link.isOneTime ? 1 : link.maxClicks || 0;
    if (effectiveLimit > 0 && link.clicks >= effectiveLimit) {
      if (link.status !== 'expired') {
        link.status = 'expired';
        await link.save();
      }
      return res.status(200).json({ status: 'expired', reason: 'Link has reached its maximum allowed clicks.' });
    }

    if (link.scheduleStart && now < link.scheduleStart) {
      return res.status(200).json({ status: 'scheduled', reason: 'Link is not active yet.', startsAt: link.scheduleStart });
    }

    return res.status(200).json({ status: 'active', link: sanitizeLink(link) });
  } catch (err) {
    console.error('Error in GET /api/links/:slug:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/links
exports.createLink = async (req, res) => {
  try {
    const parsedBody = createLinkSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parsedBody.error.format() });
    }
    const { url, targetUrl, slug, title, password, isOneTime, maxClicks, expiresAt, showPreview, collection, scheduleStart, creatorName, ownerEmail, conditionalRedirect, webhookConfig, visibility, geoFenceEnabled, allowedCountries, blockedCountries, otpEnabled, otpAllowedEmails, destinations, routingMode, fallbackUrl, ghostMode } = parsedBody.data;
    const finalUrl = (url || targetUrl || '').trim();

    // Phase 6: Subscription Limits (Entitlements)
    let maxAllowedLinks = 50; // free tier default
    let currentLinkCount = 0;
    
    if (req.workspaceId) {
      const Workspace = require('../models/Workspace');
      const workspace = await Workspace.findById(req.workspaceId);
      if (workspace) {
        if (workspace.subscriptionTier === 'enterprise') maxAllowedLinks = 10000;
        else if (workspace.subscriptionTier === 'pro') maxAllowedLinks = 1000;
        
        currentLinkCount = await Link.countDocuments({ workspaceId: req.workspaceId });
      }
    } else if (req.user) {
      currentLinkCount = await Link.countDocuments({ ownerEmail: req.user.email });
    }

    if (currentLinkCount >= maxAllowedLinks) {
      return res.status(402).json({ message: `Payment Required: You have exceeded the limit of ${maxAllowedLinks} links for your current tier. Please upgrade.` });
    }
    const finalVisibility = visibility === 'private' ? 'private' : 'public';
    const safety = basicUrlSafetyCheck(finalUrl || destinations[0]?.url || 'http://example.com');
    
    // Phase 2: Security Scanner
    const scannerResult = await scanUrl(finalUrl || destinations[0]?.url || 'http://example.com');
    if (scannerResult.scanStatus === 'dangerous') {
      return res.status(403).json({ message: 'URL blocked: detected as malware or phishing' });
    }

    let finalSlug;
    if (slug && slug.trim()) {
      const normalizedSlug = slug.trim();
      const alreadyExists = await Link.findOne({ slug: normalizedSlug });
      if (alreadyExists) return res.status(409).json({ message: 'Slug already taken' });
      finalSlug = normalizedSlug;
    } else {
      finalSlug = Math.random().toString(36).substring(2, 8);
      let exists = await Link.findOne({ slug: finalSlug });
      while (exists) {
        finalSlug = Math.random().toString(36).substring(2, 8);
        exists = await Link.findOne({ slug: finalSlug });
      }
    }

    // Process Geo-fencing & OTP fields
    let cleanAllowedCountries = [];
    if (Array.isArray(allowedCountries)) {
      cleanAllowedCountries = allowedCountries.map(c => c.trim()).filter(Boolean);
    } else if (typeof allowedCountries === 'string') {
      cleanAllowedCountries = allowedCountries.split(',').map(c => c.trim()).filter(Boolean);
    }

    let cleanBlockedCountries = [];
    if (Array.isArray(blockedCountries)) {
      cleanBlockedCountries = blockedCountries.map(c => c.trim()).filter(Boolean);
    } else if (typeof blockedCountries === 'string') {
      cleanBlockedCountries = blockedCountries.split(',').map(c => c.trim()).filter(Boolean);
    }

    let cleanOtpAllowedEmails = [];
    if (Array.isArray(otpAllowedEmails)) {
      cleanOtpAllowedEmails = otpAllowedEmails.map(e => e.trim()).filter(Boolean);
    } else if (typeof otpAllowedEmails === 'string') {
      cleanOtpAllowedEmails = otpAllowedEmails.split(',').map(e => e.trim()).filter(Boolean);
    }

    // Background AI Summary Task (will be generated after link creation)

    const now = new Date();
    const newLink = await Link.create({
      title: title || finalUrl,
      slug: finalSlug,
      targetUrl: finalUrl,
      clicks: 0,
      status: 'active',
      createdAt: now,
      password: password || null,
      isOneTime: !!isOneTime,
      maxClicks: maxClicks || 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      showPreview: !!showPreview,
      collection: collection || 'General',
      scheduleStart: scheduleStart ? new Date(scheduleStart) : null,
      creatorName: creatorName || 'Anonymous',
      ownerEmail: ownerEmail || null,
      
      // Phase 2
      destinations: destinations || [],
      routingMode: routingMode || 'single',
      fallbackUrl: fallbackUrl || null,
      ghostMode: ghostMode || { enabled: false },
      isFavorite: false,
      visibility: finalVisibility,
      conditionalRedirect: conditionalRedirect || undefined,
      webhookConfig: webhookConfig || undefined,
      safetyScore: safety.score,
      safetyVerdict: safety.verdict,
      isFlagged: safety.flagRecommended || scannerResult.scanStatus === 'suspicious',
      flagReason: scannerResult.scanStatus === 'suspicious' ? 'auto_flag_suspicious_url' : (safety.flagRecommended ? 'auto_flag_safety_scanner' : null),
      flaggedAt: (safety.flagRecommended || scannerResult.scanStatus === 'suspicious') ? now : null,
      moderationStatus: (safety.flagRecommended || scannerResult.scanStatus === 'suspicious') ? 'flagged' : 'clean',
      
      // Phase 2 Scanner Fields
      riskScore: scannerResult.riskScore,
      scanStatus: scannerResult.scanStatus,
      scanDate: now,
      // Geo-Fencing
      geoFenceEnabled: !!geoFenceEnabled,
      allowedCountries: cleanAllowedCountries,
      blockedCountries: cleanBlockedCountries,
      // Email OTP
      otpEnabled: !!otpEnabled,
      otpAllowedEmails: cleanOtpAllowedEmails,
      // AI Page Summary (will be updated via background job)
      aiSummary: null,
      aiCategory: null,
      aiReadingTime: null,
      aiKeywords: [],
    });

    // Run AI Generation asynchronously
    generateAiSummary(finalUrl)
      .then(async (aiData) => {
        if (aiData) {
          await Link.findByIdAndUpdate(newLink._id, {
            aiSummary: aiData.summary || null,
            aiCategory: aiData.category || null,
            aiReadingTime: aiData.readingTime || null,
            aiKeywords: aiData.keywords || [],
          });
        }
      })
      .catch((err) => {
        console.error('Failed to generate AI summary in background:', err);
      });

    return res.status(201).json(sanitizeLink(newLink));
  } catch (err) {
    console.error('Error in POST /api/links:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, targetUrl, password, isOneTime, maxClicks, expiresAt, showPreview, collection, creatorName, conditionalRedirect, webhookConfig, visibility, geoFenceEnabled, allowedCountries, blockedCountries, otpEnabled, otpAllowedEmails, destinations, routingMode, fallbackUrl, ghostMode } = req.body || {};

    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    if (link.ownerEmail !== req.user.email) return res.status(403).json({ message: 'You do not have permission to edit this link' });

    if (title !== undefined) link.title = title;
    if (targetUrl !== undefined && targetUrl !== link.targetUrl) {
      link.targetUrl = targetUrl;
      // Regenerate AI summary asynchronously
      generateAiSummary(targetUrl)
        .then(async (aiData) => {
          if (aiData) {
            await Link.findByIdAndUpdate(link._id, {
              aiSummary: aiData.summary || null,
              aiCategory: aiData.category || null,
              aiReadingTime: aiData.readingTime || null,
              aiKeywords: aiData.keywords || [],
            });
          }
        })
        .catch((err) => {
          console.error('Failed to regenerate AI summary on update:', err);
        });
    }
    if (password !== undefined && password !== '********') {
      link.password = password || null;
    }
    if (isOneTime !== undefined) link.isOneTime = !!isOneTime;
    if (maxClicks !== undefined) link.maxClicks = maxClicks;
    if (expiresAt !== undefined) link.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (showPreview !== undefined) link.showPreview = !!showPreview;
    if (collection !== undefined) link.collection = collection;
    if (creatorName !== undefined) link.creatorName = creatorName;
    if (conditionalRedirect !== undefined) link.conditionalRedirect = conditionalRedirect;
    if (webhookConfig !== undefined) link.webhookConfig = webhookConfig;
    if (visibility !== undefined) link.visibility = visibility === 'private' ? 'private' : 'public';
    
    // Phase 2
    if (destinations !== undefined) link.destinations = destinations;
    if (routingMode !== undefined) link.routingMode = routingMode;
    if (fallbackUrl !== undefined) link.fallbackUrl = fallbackUrl;
    if (ghostMode !== undefined) link.ghostMode = ghostMode;
    
    // Scanner Check on Update if URLs changed
    if (targetUrl !== undefined || destinations !== undefined) {
      const urlToCheck = targetUrl || (destinations && destinations[0]?.url) || 'http://example.com';
      const scannerResult = await scanUrl(urlToCheck);
      if (scannerResult.scanStatus === 'dangerous') {
        return res.status(403).json({ message: 'Update blocked: URL detected as malware or phishing' });
      }
      link.riskScore = scannerResult.riskScore;
      link.scanStatus = scannerResult.scanStatus;
      link.scanDate = new Date();
      if (scannerResult.scanStatus === 'suspicious') {
        link.isFlagged = true;
        link.flagReason = 'auto_flag_suspicious_url_update';
        link.flaggedAt = new Date();
        link.moderationStatus = 'flagged';
      }
    }

    if (geoFenceEnabled !== undefined) link.geoFenceEnabled = !!geoFenceEnabled;
    if (allowedCountries !== undefined) {
      link.allowedCountries = Array.isArray(allowedCountries)
        ? allowedCountries.map(c => c.trim()).filter(Boolean)
        : (typeof allowedCountries === 'string' ? allowedCountries.split(',').map(c => c.trim()).filter(Boolean) : []);
    }
    if (blockedCountries !== undefined) {
      link.blockedCountries = Array.isArray(blockedCountries)
        ? blockedCountries.map(c => c.trim()).filter(Boolean)
        : (typeof blockedCountries === 'string' ? blockedCountries.split(',').map(c => c.trim()).filter(Boolean) : []);
    }
    if (otpEnabled !== undefined) link.otpEnabled = !!otpEnabled;
    if (otpAllowedEmails !== undefined) {
      link.otpAllowedEmails = Array.isArray(otpAllowedEmails)
        ? otpAllowedEmails.map(e => e.trim()).filter(Boolean)
        : (typeof otpAllowedEmails === 'string' ? otpAllowedEmails.split(',').map(e => e.trim()).filter(Boolean) : []);
    }

    const updated = await link.save();
    return res.status(200).json(sanitizeLink(updated));
  } catch (err) {
    console.error('Error in PUT /api/links/:id:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /api/links/:id/favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    if (link.ownerEmail !== req.user.email) return res.status(403).json({ message: 'You do not have permission to modify this link' });

    link.isFavorite = !link.isFavorite;
    const updated = await link.save();
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Error in PATCH /api/links/:id/favorite:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /api/links/:id
exports.deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id);
    if (!link) return res.status(404).json({ message: 'Link not found' });
    if (link.ownerEmail !== req.user.email) return res.status(403).json({ message: 'You do not have permission to delete this link' });

    await Link.findByIdAndDelete(id);
    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (err) {
    console.error('Error in DELETE /api/links/:id:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/links/:slug/send-otp
exports.sendLinkOtp = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const link = await Link.findOne({ slug });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    if (!link.otpEnabled) {
      return res.status(400).json({ message: 'OTP is not enabled for this link' });
    }

    // Check allowed emails if restricted
    if (link.otpAllowedEmails && link.otpAllowedEmails.length > 0) {
      const emailLower = email.toLowerCase().trim();
      const isAllowed = link.otpAllowedEmails.some(pattern => {
        const pat = pattern.toLowerCase().trim();
        if (pat.startsWith('*@')) {
          // domain check
          const domain = pat.substring(2);
          return emailLower.endsWith(domain);
        }
        return emailLower === pat;
      });

      if (!isAllowed) {
        return res.status(403).json({ message: 'Access denied: Email is not in the allowed list' });
      }
    }

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing link_access OTP for this email
    await OTP.deleteMany({ email, purpose: 'link_access' });

    // Save OTP
    await OTP.create({
      email,
      code,
      purpose: 'link_access',
      expiresAt,
      meta: { slug },
    });

    // Send email
    await sendOtpEmail(email, code, slug);

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error in sendLinkOtp:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// POST /api/links/:slug/verify-otp
exports.verifyLinkOtp = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const link = await Link.findOne({ slug });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email,
      code: code.trim(),
      purpose: 'link_access',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired access code' });
    }

    // Single use: delete the OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate verification JWT
    const token = jwt.sign(
      { slug, email, verifiedOtp: true },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '5m' }
    );

    return res.json({ success: true, token });
  } catch (err) {
    console.error('Error in verifyLinkOtp:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
