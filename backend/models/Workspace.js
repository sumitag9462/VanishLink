const mongoose = require('mongoose');

const WorkspaceMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const WorkspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [WorkspaceMemberSchema],
  customDomains: [{ type: String }], // e.g., 'link.mybrand.com'
  subscriptionTier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  stripeCustomerId: { type: String, default: null },
  stripeSubscriptionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workspace', WorkspaceSchema);
