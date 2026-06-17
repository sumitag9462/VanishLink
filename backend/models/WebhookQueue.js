const mongoose = require('mongoose');

const webhookQueueSchema = new mongoose.Schema(
  {
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Link', required: true },
    slug: { type: String, required: true },
    event: { type: String, required: true },
    payload: { type: Object, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'failed', 'completed'],
      default: 'pending',
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    lastAttempt: { type: Date, default: null },
    nextRetry: { type: Date, default: null },
    webhookUrl: { type: String, required: true },
  },
  { timestamps: true }
);

webhookQueueSchema.index({ status: 1, nextRetry: 1 });
webhookQueueSchema.index({ linkId: 1 });

module.exports = mongoose.model('WebhookQueue', webhookQueueSchema);
