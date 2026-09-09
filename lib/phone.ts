// Phone-number normalization to E.164 — the format Twilio requires
// (e.g. +15551234567). Default country is US/Canada (+1) when no country
// code is supplied.

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Normalize a raw phone string to E.164, or return null if it can't be.
 *
 * - "+44 20 7946 0958" → "+442079460958" (kept international)
 * - "(555) 123-4567"   → "+15551234567"  (assumed US/Canada)
 * - "1-555-123-4567"   → "+15551234567"
 */
export function normalizeE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("+")) {
    const candidate = "+" + trimmed.slice(1).replace(/\D/g, "");
    return E164.test(candidate) ? candidate : null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits; // bare US/Canada number
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;

  return null;
}

/** Human-friendly display for a stored E.164 US/Canada number. */
export function formatPhoneDisplay(phone: string): string {
  const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(phone);
  if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
  return phone;
}
