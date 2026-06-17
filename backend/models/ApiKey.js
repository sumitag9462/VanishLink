const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  keyPrefix: { type: String, required: true },
  keyHash: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g., 'Production Env'
  scopes: [{ type: String, enum: ['links:read', 'links:write', 'analytics:read'], default: ['links:read', 'links:write'] }],
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', default: null }, // Optional: scoped to a workspace
  expiresAt: { type: Date, default: null },
  lastUsedAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
