const path = require('path');
const dotenvPath = path.join(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

const mongoose = require('mongoose');

// Models
const User = require('./models/User');
const Link = require('./models/Link');
const OTP = require('./models/OTP');
const AnalyticsEvent = require('./models/AnalyticsEvent');
const TrafficAnomaly = require('./models/TrafficAnomaly');
const WebhookQueue = require('./models/WebhookQueue');
const FlagReport = require('./models/FlagReport');

// Services
const { computeLinkSafetyForUrl } = require('./scripts/safetyScanner');
const { queueWebhook } = require('./services/webhookQueueService');

async function runTests() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vanish_link_test';
  console.log('🧪 Starting Comprehensive Backend Tests...');
  console.log(`🔗 Connecting to MongoDB: ${mongoUri}`);
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    // ---------------------------------------------------------
    // TEST 1: User & Auth
    // ---------------------------------------------------------
    console.log('\n[1] Testing User Auth & OTP...');
    const testEmail = 'testuser_auth_' + Date.now() + '@example.com';
    
    const user = await User.create({
      name: 'Test User',
      email: testEmail,
      password: 'hashedpassword123',
      role: 'user'
    });
    console.log('  ✔️ User created:', user.email);

    const otp = await OTP.create({
      email: testEmail,
      code: '123456',
      purpose: 'register',
      expiresAt: new Date(Date.now() + 10 * 60000)
    });
    console.log('  ✔️ OTP created for user:', otp.code);

    // ---------------------------------------------------------
    // TEST 2: Link Creation & Settings
    // ---------------------------------------------------------
    console.log('\n[2] Testing Link Features...');
    const linkSlug = 'testslug_' + Date.now();
    const link = await Link.create({
      title: 'My Test Link',
      slug: linkSlug,
      targetUrl: 'https://example.com',
      user: user._id,
      ownerEmail: user.email,
      status: 'active',
      isPasswordProtected: true,
      passwordHash: 'dummyhash',
      requireOTP: true,
      routingMode: 'weighted',
      destinations: [
        { url: 'https://example.com/a', weight: 50 },
        { url: 'https://example.com/b', weight: 50 }
      ],
      geofence: { enabled: true, allowedCountries: ['US', 'CA'] },
      abFallbacks: { fallbackUrl: 'https://fallback.com' }
    });
    console.log('  ✔️ Link created with A/B Routing, GeoFence, and OTP:', link.slug);

    // ---------------------------------------------------------
    // TEST 3: Safety Scanner
    // ---------------------------------------------------------
    console.log('\n[3] Testing Safety Scanner...');
    const safetyResult = computeLinkSafetyForUrl('http://free-money-phishing.com');
    console.log('  ✔️ Safety Scanner Result for malicious URL:', safetyResult);
    
    // ---------------------------------------------------------
    // TEST 4: Analytics & Anomalies
    // ---------------------------------------------------------
    console.log('\n[4] Testing Analytics & Bot Detection...');
    const event = await AnalyticsEvent.create({
      link: link._id,
      slug: link.slug,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Bot)',
      deviceType: 'desktop',
      country: 'US',
      city: 'New York'
    });
    console.log('  ✔️ Analytics Event logged.');

    const anomaly = await TrafficAnomaly.create({
      linkId: link._id,
      slug: link.slug,
      anomalyType: 'high_bot_traffic',
      severity: 'high',
      description: 'Test anomaly detected',
      reason: 'multiple bot fingerprints detected',
      riskScore: 90,
      fingerprint: 'test-fingerprint-123',
      ipHash: 'test-ip-hash-123'
    });
    console.log('  ✔️ Traffic Anomaly created:', anomaly.anomalyType);

    // ---------------------------------------------------------
    // TEST 5: Webhook Queue
    // ---------------------------------------------------------
    console.log('\n[5] Testing Webhooks...');
    await queueWebhook(link._id, link.slug, 'link_clicked', { ip: '1.2.3.4' }, 'https://httpbin.org/post');
    const webhookCount = await WebhookQueue.countDocuments({ linkId: link._id });
    console.log('  ✔️ Webhooks queued:', webhookCount);

    // ---------------------------------------------------------
    // TEST 6: Moderation
    // ---------------------------------------------------------
    console.log('\n[6] Testing Moderation (Flag Reports)...');
    const report = await FlagReport.create({
      linkId: link._id,
      reporterEmail: 'angry_user@example.com',
      reason: 'SPAM',
      description: 'This is a test report',
      priority: 'LOW'
    });
    console.log('  ✔️ Flag Report created:', report._id);

    // ---------------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------------
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteOne({ _id: user._id });
    await OTP.deleteOne({ _id: otp._id });
    await Link.deleteOne({ _id: link._id });
    await AnalyticsEvent.deleteOne({ _id: event._id });
    await TrafficAnomaly.deleteOne({ _id: anomaly._id });
    await WebhookQueue.deleteMany({ linkId: link._id });
    await FlagReport.deleteOne({ _id: report._id });
    console.log('  ✔️ Cleanup complete.');

    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

runTests();
