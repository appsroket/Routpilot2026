import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";
import {
  extractJsonArray,
  normalizeParsedJob,
  type ParsedJob,
} from "@/lib/import-jobs";

// Calls the Anthropic API + geocoder — needs the Node runtime, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT_CHARS = 20_000;
const MAX_JOBS = 100;

const SYSTEM_PROMPT = `You extract field-service jobs from messy, free-form dispatcher notes.

Return ONLY a JSON array — no prose, no explanation, no markdown code fences. Each element must match this schema exactly:

[
  {
    "title": string,              // short description of the work, e.g. "AC not cooling"
    "customer_name": string,      // person or business name, "" if unknown
    "address": string,            // best full street address you can infer, "" if none
    "time_window_start": string | null,  // "HH:MM" 24-hour, or null
    "time_window_end": string | null,    // "HH:MM" 24-hour, or null
    "duration_min": number,       // estimated minutes; default 30 if unstated
    "notes": string               // any leftover detail, "" if none
  }
]

Rules:
- One object per distinct job. Jobs are usually separated by newlines, semicolons, or numbering.
- Infer a concise title from the described problem; don't just repeat the customer name.
- Convert times like "9am", "11:30", "1pm" to 24-hour "HH:MM". If only a start time is given, set time_window_end to null.
- If a duration like "needs 1hr" or "2 hours" appears, convert to minutes; otherwise use 30.
- Never invent addresses or times that aren't implied by the text; use "" or null instead.
- If the text contains no jobs, return [].`;

type ImportRequest = {
  text?: unknown;
  date?: unknown;
  technicianId?: unknown;
};

export async function POST(request: Request) {
  // 1. Authenticate.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "You must be signed in." }, { status: 401 });
  }

  // 2. Validate input.
  let body: ImportRequest;
  try {
    body = (await request.json()) as ImportRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json(
      { ok: false, error: "Paste some job text first." },
      { status: 400 },
    );
  }
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { ok: false, error: "That's a lot of text — please import it in smaller batches." },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "AI import isn't configured — set ANTHROPIC_API_KEY." },
      { status: 500 },
    );
  }

  // 3. Ask Claude to extract structured jobs.
  const client = new Anthropic({ apiKey });
  let responseText = "";
  try {
    const message = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 8000,
      output_config: { effort: "medium" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });
    if (message.stop_reason === "refusal") {
      return NextResponse.json(
        { ok: false, error: "The assistant declined to process this text." },
        { status: 422 },
      );
    }
    responseText = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { ok: false, error: "The AI service is busy — try again in a moment." },
        { status: 429 },
      );
    }
    console.error("import-jobs: Anthropic call failed:", err);
    return NextResponse.json(
      { ok: false, error: "Couldn't reach the AI service. Please try again." },
      { status: 502 },
    );
  }

  // 4. Parse the JSON safely.
  const rawArray = extractJsonArray(responseText);
  if (!rawArray) {
    return NextResponse.json(
      {
        ok: false,
        error: "Couldn't read the jobs from that text. Try rephrasing or importing fewer at once.",
      },
      { status: 422 },
    );
  }

  const normalized = rawArray
    .map(normalizeParsedJob)
    .filter((j): j is NonNullable<typeof j> => j !== null)
    .slice(0, MAX_JOBS);

  if (normalized.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No jobs found in that text." },
      { status: 422 },
    );
  }

  // 5. Geocode each address so the imported jobs are map-ready. Best-effort:
  //    a miss just leaves lat/lng null (the address still geocodes on save).
  const jobs: ParsedJob[] = await Promise.all(
    normalized.map(async (job) => {
      let lat: number | null = null;
      let lng: number | null = null;
      if (job.address) {
        const geo = await geocodeAddress(job.address);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      }
      return { ...job, lat, lng };
    }),
  );

  // 6. Return for review — nothing is saved yet.
  return NextResponse.json({ ok: true, jobs });
}
