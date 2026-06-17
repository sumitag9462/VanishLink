const mongoose = require('mongoose');

const ghostVisitorSchema = new mongoose.Schema(
  {
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    slug: { type: String, required: true },
    ipHash: { type: String, required: true },
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    device: { type: String, default: 'Unknown' },
    referrer: { type: String, default: 'Direct' },
    timezone: { type: String, default: 'Unknown' },
    language: { type: String, default: 'Unknown' },
    riskScore: { type: Number, default: 0 },
    decoyUsed: { type: String, default: null }, // URL they were sent to
    isHoneypot: { type: Boolean, default: false }, // If they hit the honeypot page
  },
  { timestamps: true }
);

ghostVisitorSchema.index({ linkId: 1 });
ghostVisitorSchema.index({ slug: 1 });
ghostVisitorSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GhostVisitor', ghostVisitorSchema);
