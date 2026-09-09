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

Dark by default. Tokens live in `app/globals.css` (as CSS variables, wired to
shadcn/ui) and `tailwind.config.ts`.

| Role            | Value     | Tailwind             |
| --------------- | --------- | -------------------- |
| Background      | `#0a0a0a` | `bg-background`      |
| Surface / cards | `#111111` | `bg-card`            |
| Border          | `#1f1f1f` | `border-border`      |
| Accent (lime)   | `#b8f724` | `bg-primary` (black text) |
| Text primary    | `#ffffff` | `text-foreground`    |
| Text secondary  | `#a0a0a0` | `text-muted-foreground` |

- Fonts: **Syne** for headings (`font-heading`, `--font-syne`), **DM Sans**
  for body/UI (`font-sans`, `--font-display`).
- Border radius: **8px max** (`--radius: 0.5rem`).
- No gradients, no blobs. Buttons are lime background with black text.

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

- Keep the app dark-mode-first; use the semantic Tailwind tokens above rather
  than raw hex where possible.
- Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`,
  `TWILIO_*`, `GOOGLE_MAPS_API_KEY`) must never be imported into client
  components — only `NEXT_PUBLIC_*` values are safe there.
