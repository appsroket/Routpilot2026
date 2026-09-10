# RoutePilot — Project Guide

RoutePilot is a job routing and dispatch app for field service teams
(fleet management & route optimization). This file orients future work in
this repository.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** (New York style, neutral base, CSS variables)
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) — auth + data
- **Google Maps** (`@googlemaps/js-api-loader`) — mapping / routing
- **dnd-kit** — drag-and-drop job assignment
- **Stripe** (`stripe`, `@stripe/stripe-js`) — billing
- **Twilio** — SMS notifications
- **Recharts** — analytics/dashboards
- **react-hook-form** + **zod** (`@hookform/resolvers`) — forms & validation
- **sonner** — toasts · **lucide-react** — icons · **date-fns** — dates

## Commands

```bash
npm run dev     # start the dev server (http://localhost:3000)
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit  # type-check
```

## Design system

Light by default — purple + gold. Tokens live in `app/globals.css` (as CSS
variables, wired to shadcn/ui) and `tailwind.config.ts`.

| Role             | Value     | Tailwind             |
| ---------------- | --------- | -------------------- |
| Background       | `#f8f7fe` | `bg-background`      |
| Surface / cards  | `#ffffff` | `bg-card`            |
| Border           | `#e4e1f0` | `border-border`      |
| Accent (purple)  | `#5a2fda` | `bg-primary` (white text) |
| CTA (gold)       | `#fbc21a` | `bg-cta` (near-black text) |
| Text primary     | `#1b1930` | `text-foreground`    |
| Text secondary   | `#6b6b7b` | `text-muted-foreground` |

- Fonts: **Syne** for headings (`font-heading`, `--font-syne`), **DM Sans**
  for body/UI (`font-sans`, `--font-display`).
- Border radius: **12px** (`--radius: 0.75rem`).
- Primary buttons are purple with white text; marketing CTAs use gold
  (`bg-cta`) with near-black text. Purple gradient bands (hero, stats, final
  CTA) carry white text.

## Structure

```
app/
  (auth)/       login, signup, callback (Supabase auth)
  (dashboard)/  dashboard, jobs, map, technicians, settings, billing (+ sidebar layout)
  api/          route handlers
components/
  ui/           shadcn/ui components
lib/
  supabase/     browser + server clients
  stripe.ts  google.ts  twilio.ts  utils.ts (cn)
types/          shared types
middleware.ts   session refresh / route gating (stub)
```

## Environment

Copy `.env.example` to `.env.local` and fill in the values (Supabase, Google
Maps, Twilio, Stripe, app URL). `.env.local` is git-ignored.

## Conventions

- Keep the app light-mode-first; use the semantic Tailwind tokens above rather
  than raw hex where possible.
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
  `TWILIO_*`, `GOOGLE_MAPS_API_KEY`) must never be imported into client
  components — only `NEXT_PUBLIC_*` values are safe there.
