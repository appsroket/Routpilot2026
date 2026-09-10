import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LeadBody = { name?: unknown; email?: unknown; company?: unknown };

// Demo-request lead capture. Forwards to WEBHOOK_URL if configured; if the env
// var is empty we simply accept the lead so nothing breaks in that case.
export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  const webhook = process.env.WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          source: "routepilot-landing",
          submitted_at: new Date().toISOString(),
        }),
      });
    } catch (err) {
      // A downstream outage shouldn't surface as an error to the visitor.
      console.error("lead: webhook forward failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
