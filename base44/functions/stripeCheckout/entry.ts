import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, return_url } = await req.json();

    // Find or create subscription record
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email });
    let sub = subs[0];

    if (action === "checkout") {
      // Find or create Stripe customer
      let customerId = sub?.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.full_name || undefined,
          metadata: { app_user_email: user.email },
        });
        customerId = customer.id;

        if (sub) {
          await base44.asServiceRole.entities.Subscription.update(sub.id, { stripe_customer_id: customerId });
        } else {
          sub = await base44.asServiceRole.entities.Subscription.create({
            user_email: user.email,
            stripe_customer_id: customerId,
            plan: "free",
            status: "none",
          });
        }
      }

      // Create a checkout session for the Pro plan
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: { name: "ALT CTRL Pro", description: "Full access to AI coaching, strategy, and analytics tools." },
            unit_amount: 1500, // $15.00
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: return_url || req.headers.get("origin") + "/app/billing?success=true",
        cancel_url: return_url || req.headers.get("origin") + "/app/billing?canceled=true",
        metadata: { user_email: user.email },
      });

      return Response.json({ url: session.url });
    }

    if (action === "portal") {
      if (!sub?.stripe_customer_id) {
        return Response.json({ error: "No subscription found" }, { status: 400 });
      }
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: sub.stripe_customer_id,
        return_url: return_url || req.headers.get("origin") + "/app/billing",
      });
      return Response.json({ url: portalSession.url });
    }

    if (action === "status") {
      return Response.json({
        plan: sub?.plan || "free",
        status: sub?.status || "none",
        current_period_end: sub?.current_period_end || null,
        cancel_at_period_end: sub?.cancel_at_period_end || false,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});