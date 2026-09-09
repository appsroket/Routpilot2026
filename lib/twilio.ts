import twilio, { type Twilio } from "twilio";

import { normalizeE164 } from "./phone";

// Server-side Twilio client for SMS notifications. The client is built lazily
// so a missing/empty config never crashes at import time (e.g. during build).
let client: Twilio | null = null;

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

function getClient(): Twilio {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "Twilio is not configured — set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.",
    );
  }
  if (!client) client = twilio(sid, token);
  return client;
}

/**
 * Send an SMS from TWILIO_FROM_NUMBER. Validates the recipient into E.164
 * first (Twilio requires it). Throws with a clear message on config or send
 * errors so callers can surface them.
 */
export async function sendSms(to: string, body: string) {
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) {
    throw new Error("Twilio is not configured — set TWILIO_FROM_NUMBER.");
  }

  const e164 = normalizeE164(to);
  if (!e164) {
    throw new Error(`Recipient phone is not a valid E.164 number: ${to}`);
  }

  const message = await getClient().messages.create({ to: e164, from, body });
  return { sid: message.sid, to: e164 };
}
