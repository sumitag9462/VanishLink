const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// In a real production app, Stripe webhooks must use express.raw({type: 'application/json'})
// so the signature can be verified.
router.post('/webhook', express.json(), billingController.handleStripeWebhook);

module.exports = router;
