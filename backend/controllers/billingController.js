const Workspace = require('../models/Workspace');
const crypto = require('crypto');

// In a real application, you would initialize the stripe SDK here:
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handleStripeWebhook = async (req, res) => {
  // Stripe webhooks must be verified using the raw body and a signing secret.
  // For this implementation, we will simulate the parsing of the event.
  
  const sig = req.headers['stripe-signature'];
  const event = req.body; // In reality, this must be parsed via Stripe SDK

  try {
    // Simulated Event Handling
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Find the workspace ID hidden in the metadata when the checkout session was created
        if (session.client_reference_id) {
          const workspace = await Workspace.findById(session.client_reference_id);
          if (workspace) {
            workspace.subscriptionTier = 'pro'; // Upgrade tier
            workspace.stripeCustomerId = session.customer;
            workspace.stripeSubscriptionId = session.subscription;
            await workspace.save();
            console.log(`Workspace ${workspace.name} upgraded to PRO`);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.past_due': {
        const subscription = event.data.object;
        const downgradedWorkspace = await Workspace.findOne({ stripeSubscriptionId: subscription.id });
        if (downgradedWorkspace) {
          downgradedWorkspace.subscriptionTier = 'free'; // Downgrade to free
          await downgradedWorkspace.save();
          console.log(`Workspace ${downgradedWorkspace.name} downgraded to FREE`);
        }
        break;
      }
        
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
  } catch (err) {
    console.error('Stripe Webhook Error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
