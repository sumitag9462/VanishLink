const https = require('https');
const http = require('http');
const WebhookQueue = require('../models/WebhookQueue');

const RETRY_DELAYS = [5000, 15000, 45000]; // 5s, 15s, 45s

exports.queueWebhook = async (linkId, slug, eventType, payload, webhookUrl) => {
  if (!webhookUrl) return;
  try {
    await WebhookQueue.create({
      linkId,
      slug,
      event: eventType,
      payload,
      webhookUrl,
      status: 'pending',
      nextRetry: new Date(),
    });
  } catch (err) {
    console.error('Failed to queue webhook:', err);
  }
};

exports.processQueue = async () => {
  try {
    const now = new Date();
    // Find pending webhooks that are ready to be processed
    const webhooks = await WebhookQueue.find({
      status: { $in: ['pending', 'failed'] },
      nextRetry: { $lte: now },
      attempts: { $lt: 3 },
    });

    for (const hook of webhooks) {
      hook.status = 'processing';
      hook.lastAttempt = now;
      hook.attempts += 1;
      await hook.save();

      try {
        await sendRequest(hook.webhookUrl, hook.payload);
        hook.status = 'completed';
        hook.lastError = null;
      } catch (err) {
        hook.lastError = err.message;
        if (hook.attempts >= 3) {
          hook.status = 'failed'; // Max retries reached
          hook.nextRetry = null;
        } else {
          hook.status = 'failed';
          hook.nextRetry = new Date(Date.now() + RETRY_DELAYS[hook.attempts - 1]);
        }
      }
      await hook.save();
    }
  } catch (err) {
    console.error('Error processing webhook queue:', err);
  }
};

function sendRequest(webhookUrl, payload) {
  return new Promise((resolve, reject) => {
    let urlObj;
    try {
      urlObj = new URL(webhookUrl);
    } catch {
      return reject(new Error('Invalid URL'));
    }

    const payloadStr = JSON.stringify(payload);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadStr),
        },
      },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Status ${res.statusCode}`));
        }
      }
    );

    req.on('error', (e) => reject(e));
    req.write(payloadStr);
    req.end();
  });
}
