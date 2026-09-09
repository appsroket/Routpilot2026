import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe signature verification needs the Node runtime and the raw body.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubRow = {
  stripe_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_end: string | null;
};

// Stripe moved current_period_end onto items in newer API versions; read it
// from wherever it exists.
function periodEndISO(sub: Stripe.Subscription): string | null {
  const top = (sub as unknown as { current_period_end?: number }).current_period_end;
  const item = sub.items?.data?.[0] as unknown as { current_period_end?: number } | undefined;
  const secs = typeof top === "number" ? top : item?.current_period_end;
  return typeof secs === "number" ? new Date(secs * 1000).toISOString() : null;
}

/**
 * Apply the desired fields to the subscription row matched by
 * stripe_customer_id — but only when something actually changed, so replays
 * of the same event are no-ops (idempotency).
 */
async function applyIfChanged(
  supabase: SupabaseClient,
  customerId: string,
  next: Partial<SubRow>,
) {
  const { data: row } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, plan, status, current_period_end")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!row) {
    console.warn(`Stripe webhook: no subscription row for customer ${customerId}`);
    return;
  }
  const current = row as SubRow;

  const changed = (Object.keys(next) as (keyof SubRow)[]).some(
    (key) => next[key] !== undefined && next[key] !== current[key],
  );
  if (!changed) return; // duplicate / already applied

  await supabase
    .from("subscriptions")
    .update({ ...next, updated_at: new Date().toISOString() })
    .eq("stripe_customer_id", customerId);
}

function customerIdOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured — set STRIPE_WEBHOOK_SECRET." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  let stripe: Stripe;
  let event: Stripe.Event;
  try {
    stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error(
      "Stripe webhook signature verification failed:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = customerIdOf(session.customer);
        const subscriptionId = customerIdOf(session.subscription);
        if (!customerId || !subscriptionId) break;

        // Pull the subscription for its period end.
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await applyIfChanged(supabase, customerId, {
          stripe_subscription_id: subscriptionId,
          plan: "pro",
          status: "active",
          current_period_end: periodEndISO(sub),
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = customerIdOf(sub.customer);
        if (!customerId) break;
        await applyIfChanged(supabase, customerId, {
          stripe_subscription_id: sub.id,
          status: sub.status,
          current_period_end: periodEndISO(sub),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = customerIdOf(sub.customer);
        if (!customerId) break;
        await applyIfChanged(supabase, customerId, { status: "canceled" });
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error(`Stripe webhook handler error (${event.type}):`, err);
    // 500 lets Stripe retry transient failures (e.g. a DB blip).
    return NextResponse.json({ received: true, error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
