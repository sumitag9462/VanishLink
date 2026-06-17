// server/models/AnalyticsEvent.js
const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    slug: { type: String, required: true },

    ip: { type: String },
    userAgent: { type: String },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
      default: 'unknown',
    },
    country: { type: String, default: 'Unknown' },
    visitorEmail: { type: String, default: null },

    // Phase 2 Fields
    destinationChosen: { type: String, default: null },
    fallbackUsed: { type: Boolean, default: false },
    botDetected: { type: Boolean, default: false },
    routingMode: { type: String, default: 'single' },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ link: 1, createdAt: -1 });
analyticsEventSchema.index({ slug: 1, createdAt: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
