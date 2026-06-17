const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const NotificationSettingsSchema = new mongoose.Schema(
  {
    emailOnDestruction: { type: Boolean, default: true },
    suspiciousActivity: { type: Boolean, default: true },
  },
  { _id: false }
);

const DefaultSettingsSchema = new mongoose.Schema(
  {
    collection: { type: String, default: 'General' },
    showPreview: { type: Boolean, default: true },
    maxClicks: { type: Number, default: 0 },
    isOneTime: { type: Boolean, default: false },
  },
  { _id: false }
);

const PrivacySettingsSchema = new mongoose.Schema(
  {
    showCreatorName: { type: Boolean, default: true },
    enableReferrerTracking: { type: Boolean, default: true },
    allowLinkSuggestions: { type: Boolean, default: true },
  },
  { _id: false }
);

const SecuritySettingsSchema = new mongoose.Schema(
  {
    notifyNewDevice: { type: Boolean, default: true },
    notifyFailedAttempt: { type: Boolean, default: true },
  },
  { _id: false }
);

const AutoDestructRulesSchema = new mongoose.Schema(
  {
    expireAfterDays: { type: Number, default: null }, // null = no auto-expire
    destroyOnFirstClick: { type: Boolean, default: false },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    device: { type: String },
    ip: { type: String },
    lastActive: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    lastLoginAt: { type: Date, default: null },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    providerId: { type: String, default: null },
    avatar: { type: String, default: null },
    avatarColor: { type: String, default: '#10B981' },
    timezone: { type: String, default: 'UTC' },
    notificationSettings: { type: NotificationSettingsSchema, default: () => ({}) },
    defaultSettings: { type: DefaultSettingsSchema, default: () => ({}) },
    privacy: { type: PrivacySettingsSchema, default: () => ({}) },
    securitySettings: { type: SecuritySettingsSchema, default: () => ({}) },
    autoDestructRules: { type: AutoDestructRulesSchema, default: () => ({}) },
    twoFactorEnabled: { type: Boolean, default: false },
    sessions: { type: [SessionSchema], default: [] },
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (!this.password) return;
  // Skip hashing if it's already a bcrypt hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
