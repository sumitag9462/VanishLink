const mongoose = require('mongoose');

const trafficAnomalySchema = new mongoose.Schema(
  {
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    slug: { type: String, required: true },
    ipHash: { type: String, required: true },
    fingerprint: { type: String, required: true },
    isBot: { type: Boolean, default: false },
    riskScore: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

trafficAnomalySchema.index({ linkId: 1, ipHash: 1 });
trafficAnomalySchema.index({ createdAt: -1 }, { expireAfterSeconds: 604800 }); // TTL index 7 days

module.exports = mongoose.model('TrafficAnomaly', trafficAnomalySchema);
