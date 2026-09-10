import Link from "next/link";

import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <Logo markClassName="h-8 w-8" textClassName="text-2xl" />

      <h1 className="max-w-2xl font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
        Smarter routing and dispatch for field service teams.
      </h1>

      <p className="max-w-xl text-base text-muted-foreground">
        Plan routes, assign jobs, and keep every technician moving — all from one
        clean dashboard.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Open dashboard
        </Link>
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
