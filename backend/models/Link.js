// server/models/Link.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---- Conditional redirect sub-schemas ----

const TimeWindowSchema = new mongoose.Schema(
  {
    // 0–23 (24h)
    startHour: { type: Number, min: 0, max: 23, required: true },
    endHour: { type: Number, min: 0, max: 23, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const ClickRangeSchema = new mongoose.Schema(
  {
    minClicks: { type: Number, default: 0 },
    maxClicks: { type: Number, default: null }, // null = no upper bound
    url: { type: String, required: true },
  },
  { _id: false }
);

const ConditionalRedirectSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },

    // device-based overrides
    deviceRules: {
      mobileUrl: { type: String, default: null },
      desktopUrl: { type: String, default: null },
      tabletUrl: { type: String, default: null },
      botUrl: { type: String, default: null },
    },

    // list of time windows (server local time)
    timeOfDayRules: {
      type: [TimeWindowSchema],
      default: [],
    },

    // weekday vs weekend
    dayTypeRules: {
      weekdayUrl: { type: String, default: null },
      weekendUrl: { type: String, default: null },
    },

    // click-count-based routing
    clickRules: {
      type: [ClickRangeSchema],
      default: [],
    },
  },
  { _id: false }
);

// ---- Webhook config ----
const WebhookConfigSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    url: { type: String, default: null },
    secret: { type: String, default: null }, // sent as header for verification

    triggers: {
      onFirstClick: { type: Boolean, default: false },
      onExpiry: { type: Boolean, default: false },
      onOneTimeComplete: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

// ---- Ghost Mode config ----
const GhostModeSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    secretToken: { type: String, default: null }, // Stored securely/hashed
    decoyUrl: { type: String, default: null },
    aiDecoy: { type: Boolean, default: false },
    failedAttempts: { type: Number, default: 0 },
    destroyAfterAttempts: { type: Number, default: null },
    adaptiveDetection: { type: Boolean, default: false },
    geoRestrictions: { type: [String], default: [] },
    deviceRestrictions: { type: [String], default: [] },
    timeRestrictions: { type: Object, default: null },
    analyticsEnabled: { type: Boolean, default: true },
    honeypotMode: { type: Boolean, default: false },
  },
  { _id: false }
);

const linkSchema = new mongoose.Schema(
  {
    title: { type: String },
    // optional meta / description text – useful for similarity
    metaDescription: { type: String, default: null },

    slug: { type: String, required: true, unique: true },
    targetUrl: { type: String, required: true }, // Keep for backward compatibility / single routing

    // A/B Testing & Routing
    destinations: {
      type: [{ url: String, weight: Number }],
      default: [],
    },
    routingMode: {
      type: String,
      enum: ['single', 'weighted', 'random', 'round-robin', 'sequential'],
      default: 'single',
    },
    currentRouteIndex: { type: Number, default: 0 },

    // Fallback
    fallbackUrl: { type: String, default: null },

    // Phase 3: Deep Linking
    iosUrl: { type: String, default: null },
    androidUrl: { type: String, default: null },
    
    // Phase 3: GDPR Compliance Mode
    gdprMode: { type: Boolean, default: false },

    // Phase 3: Workspace Reference
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null },

    // NEW: link visibility
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    password: { type: String, default: null },
    isOneTime: { type: Boolean, default: false },
    maxClicks: { type: Number, default: 0 }, // 0 = unlimited
    expiresAt: { type: Date, default: null },
    showPreview: { type: Boolean, default: false },
    collection: { type: String, default: 'General' },
    scheduleStart: { type: Date, default: null },

    // Geo-Fencing
    geoFenceEnabled: { type: Boolean, default: false },
    allowedCountries: [{ type: String }],
    blockedCountries: [{ type: String }],

    // Email OTP Auth
    otpEnabled: { type: Boolean, default: false },
    otpAllowedEmails: [{ type: String }],

    // AI Page Summary
    aiSummary: { type: String, default: null },
    aiCategory: { type: String, default: null },
    aiReadingTime: { type: Number, default: null },
    aiKeywords: [{ type: String }],

    clicks: { type: Number, default: 0 },
    status: { type: String, default: 'active' },

    // Creator info
    creatorName: { type: String, default: 'Anonymous' },
    creatorAvatar: { type: String, default: null }, // URL to creator's avatar

    // Who actually owns this link (for per-user dashboards)
    ownerEmail: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Favorites / Highlights
    isFavorite: { type: Boolean, default: false },

    // 🔎 Moderation fields
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: null },
    flaggedAt: { type: Date, default: null },

    // clean = normal, flagged = under review, removed = policy-removal
    moderationStatus: {
      type: String,
      enum: ['clean', 'flagged', 'removed'],
      default: 'clean',
    },
    moderatedBy: { type: String, default: null },
    moderatedAt: { type: Date, default: null },
    moderationNotes: { type: String, default: null },

    safetyScore: { type: Number, default: null },
    safetyVerdict: {
      type: String,
      enum: [null, 'low', 'medium', 'high'],
      default: null,
    },

    // 🛡️ Malware & Phishing Scanner
    riskScore: { type: Number, default: null },
    scanStatus: {
      type: String,
      enum: ['safe', 'suspicious', 'dangerous', 'pending'],
      default: 'pending',
    },
    scanDate: { type: Date, default: null },

    // 🧠 Dynamic conditional redirect config
    conditionalRedirect: {
      type: ConditionalRedirectSchema,
      default: () => ({}),
    },

    // 🌐 Webhook configuration per link
    webhookConfig: {
      type: WebhookConfigSchema,
      default: () => ({
        enabled: false,
        triggers: {},
      }),
    },

    // 👻 Ghost Mode
    ghostMode: {
      type: GhostModeSchema,
      default: () => ({
        enabled: false,
      }),
    },
  },
  { timestamps: true }
);

// Hash password before saving if modified
linkSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  if (this.isModified('ghostMode.secretToken') && this.ghostMode && this.ghostMode.secretToken) {
    const salt = await bcrypt.genSalt(10);
    this.ghostMode.secretToken = await bcrypt.hash(this.ghostMode.secretToken, salt);
  }
});

linkSchema.index({ ownerEmail: 1 });
linkSchema.index({ createdBy: 1 });
linkSchema.index({ workspaceId: 1 });
linkSchema.index({ status: 1 });
linkSchema.index({ visibility: 1 });
linkSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Link', linkSchema);
