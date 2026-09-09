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

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("owner_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { ok: false, error: "No billing account yet — upgrade first." },
      { status: 400 },
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Stripe is not configured.";
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }

  const origin = resolveOrigin(request);
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/billing`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Could not open the billing portal.";
    return NextResponse.json({ ok: false, error: detail }, { status: 502 });
  }
}
