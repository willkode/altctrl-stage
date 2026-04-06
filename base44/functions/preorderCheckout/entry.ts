import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.7.0';

const stripe = new Stripe(Deno.env.get("STRIPE_API_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, tiktok_handle, return_url } = await req.json();

    if (!email || !name) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Create pre-order record
    const preorder = await base44.asServiceRole.entities.PreOrder.create({
      email,
      name,
      tiktok_handle: tiktok_handle || "",
      status: "pending",
    });

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { preorder_id: preorder.id, tiktok_handle: tiktok_handle || "" },
    });

    // Create checkout session at pre-order price ($15/mo)
    const origin = req.headers.get("origin") || "https://app.base44.com";
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "ALT CTRL Pro — Pre-Order",
            description: "Locked-in pre-order rate: $15/mo forever. Full access to all AI coaching, strategy, and analytics tools.",
          },
          unit_amount: 1500,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      success_url: (return_url || origin) + "/preorder?success=true",
      cancel_url: (return_url || origin) + "/preorder?canceled=true",
      metadata: { preorder_id: preorder.id, user_email: email },
    });

    // Save stripe session ID to pre-order
    await base44.asServiceRole.entities.PreOrder.update(preorder.id, {
      stripe_session_id: session.id,
    });

    return Response.json({ url: session.url, preorder_id: preorder.id });
  } catch (error) {
    console.error("Pre-order checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});