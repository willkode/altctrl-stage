import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  // Initialize base44 BEFORE signature validation (required for auth token extraction)
  const base44 = createClientFromRequest(req);

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log("Stripe webhook event:", event.type);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email;
      if (!userEmail) return Response.json({ received: true });

      const subscriptionId = session.subscription;
      const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

      const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
      const sub = subs[0];
      if (sub) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          plan: "pro",
          status: "active",
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const stripeSub = event.data.object;
      const subs = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: stripeSub.id });
      const sub = subs[0];
      if (sub) {
        const isActive = ["active", "trialing"].includes(stripeSub.status);
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          status: stripeSub.status,
          plan: isActive ? "pro" : "free",
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSub.cancel_at_period_end || false,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const stripeSub = event.data.object;
      const subs = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: stripeSub.id });
      const sub = subs[0];
      if (sub) {
        await base44.asServiceRole.entities.Subscription.update(sub.id, {
          plan: "free",
          status: "canceled",
          cancel_at_period_end: false,
        });
      }
    }

    // Handle failed payment — mark subscription as past_due so app blocks access
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const subId = invoice.subscription;
      if (subId) {
        const subs = await base44.asServiceRole.entities.Subscription.filter({ stripe_subscription_id: subId });
        const sub = subs[0];
        if (sub) {
          await base44.asServiceRole.entities.Subscription.update(sub.id, {
            status: "past_due",
            plan: "free",
          });
          console.log("Marked subscription as past_due for:", sub.user_email);
        }
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});