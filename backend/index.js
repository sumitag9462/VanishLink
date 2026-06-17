// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const https = require('https'); // for webhook requests
const { Server } = require('socket.io');
require('dotenv').config();
const env = require('./config/env');
const { corsOptions, noSqlSanitizer, securityHeaders } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const watchRoutes = require('./routes/watchRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const Link = require('./models/Link');
const AnalyticsEvent = require('./models/AnalyticsEvent');
const { sanitizeLink, sanitizeLinks } = require('./utils/linkSanitizer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminRoutes = require('./routes/adminRoutes');
const adminLinkRoutes = require('./routes/adminLinkRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const { router: authRoutes, authenticate } = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Rate limiting and security middleware
const { generalLimiter, authLimiter, linkCreationLimiter, redirectLimiter } = require('./middleware/rateLimiter');
const { ipBlocker } = require('./middleware/ipBlocker');
const settingsRoutes = require('./routes/settingsRoutes');
const adminAuditRoutes = require('./routes/adminAuditRoutes');
const securityRoutes = require('./routes/securityRoutes');
const { basicUrlSafetyCheck } = require('./scripts/urlSafety');
const linkRoutes = require('./routes/linkRoutes');
const redirectController = require('./controllers/redirectController');


const app = express();
const PORT = env.PORT;

const passport = require('passport');
require('./config/passport');

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders());
app.use(cors(corsOptions()));
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(noSqlSanitizer);
app.use(passport.initialize());

// Apply IP blocking globally (first line of defense)
app.use(ipBlocker);

// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// ---- Auth routes with stricter rate limiting ----
app.use('/api/auth', authLimiter, authRoutes);

// ---- MongoDB connection ----
const MONGO_URI =
  env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ---------------- REST ROUTES ---------------- //

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// watch party REST routes (protected)
app.use('/api/watch', authenticate, watchRoutes);

// analytics REST routes (REAL data) - protected
app.use('/api/analytics', authenticate, analyticsRoutes);

// Admin middleware - must be logged in AND be admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// admin link management routes (more specific -> mount first)
app.use('/api/admin/links', authenticate, requireAdmin, adminLinkRoutes);

// admin audit-log routes (mount before /api/admin so it is not shadowed)
app.use('/api/admin/audit-logs', authenticate, requireAdmin, adminAuditRoutes);

// admin user access controls (mount before generic /api/admin)
app.use('/api/admin/users', authenticate, requireAdmin, adminUserRoutes);

// other admin routes
app.use('/api/admin', authenticate, requireAdmin, adminRoutes);

// moderation routes (reports can be public, review is admin-only)
app.use('/api/moderation', moderationRoutes);
// system settings
app.use('/api/settings', settingsRoutes);

// AI Chatbot
app.use('/api/chat', chatRoutes);

// security / URL scan API
app.use('/api/security', securityRoutes);

// similarity / helper link routes
app.use('/api/links', linkRoutes);

// Basic Health Check (Unauthenticated)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// Apply routes
app.use('/api/auth', authRoutes);

// workspace routes
const workspaceRoutes = require('./routes/workspaceRoutes');
app.use('/api/workspaces', workspaceRoutes);

// developer API keys routes
const apiKeysRoutes = require('./routes/apiKeysRoutes');
app.use('/api/keys', apiKeysRoutes);

// biolinks routes
const biolinkRoutes = require('./routes/biolinkRoutes');
app.use('/api/biolinks', biolinkRoutes);

// billing & subscription routes
const billingRoutes = require('./routes/billingRoutes');
app.use('/api/billing', billingRoutes);

// ✅ REAL REDIRECT ENDPOINT (ATOMIC & CONFLICT-FREE)
const { geoFence } = require('./middleware/geoFence');
app.get('/r/:slug', redirectLimiter, geoFence, redirectController.handleRedirect);


// ---------------- SOCKET.IO ---------------- //
const socketManager = require('./sockets/socketManager');

const server = http.createServer(app);
socketManager.init(server, app);

// ---------------- WEBHOOK QUEUE WORKER ---------------- //
const { processQueue } = require('./services/webhookQueueService');
setInterval(() => {
  processQueue().catch(err => console.error('Webhook queue error:', err));
}, 10000); // Check every 10 seconds

const redisService = require('./services/redisService');

redisService.initRedis().then(() => {
  server.listen(PORT, () => {
    console.log(`API + Socket server running on http://localhost:${PORT}`);
  });
});

app.use(notFound);
app.use(errorHandler);
