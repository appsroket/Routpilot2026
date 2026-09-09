import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

function resolveOrigin(request: Request) {
  return (
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { ok: false, error: "Billing is not configured — set STRIPE_PRICE_ID." },
      { status: 500 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Stripe is not configured.";
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }

  // Reuse or create the Stripe customer, persisted on the subscriptions row.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("owner_id", user.id)
    .single();

  let customerId = sub?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { owner_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("owner_id", user.id);
  }

  const origin = resolveOrigin(request);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=cancel`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ ok: false, error: detail }, { status: 502 });
  }
}
