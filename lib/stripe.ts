import Stripe from "stripe";

// Server-side Stripe client, constructed lazily so an empty/missing key never
// crashes at import time (e.g. during build).
let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured — set STRIPE_SECRET_KEY.");
  }
  if (!client) client = new Stripe(key, { typescript: true });
  return client;
}
