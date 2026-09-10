import { ArrowRight, PlayCircle } from "lucide-react";

import { Reveal } from "./reveal";
import { CtaLink } from "./cta";
import { SIGNUP_HREF, DEMO_HREF } from "./constants";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#4338ca] px-6 pb-24 pt-36 text-white md:pb-32 md:pt-44">
      {/* Soft glow orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 -z-0 h-[420px] w-[620px] max-w-[90vw] -translate-x-1/2 rounded-full bg-white/10 blur-[130px]"
      />
      {/* Dot grid with radial mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 60% 55% at 50% 35%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 55% at 50% 35%, black, transparent 75%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <Reveal delay={0}>
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-white/80">
            Route optimization for home service crews
          </span>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 font-heading text-[2rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-7xl">
            Turn Wasted Drive Time Into{" "}
            <span className="text-cta">Billable Hours</span>
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            RoutePilot builds the fastest route for every technician&apos;s day and
            texts it straight to their phone — so your crew spends less time crossing
            town and more time on paid jobs.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href={SIGNUP_HREF} className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="size-4" />
            </CtaLink>
            <CtaLink
              href={DEMO_HREF}
              external
              variant="ghost"
              className="w-full border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10 sm:w-auto"
            >
              <PlayCircle className="size-4" />
              See a 2-min demo
            </CtaLink>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <p className="mt-5 text-sm text-white/70">
            Free trial · No card to start · Cancel anytime
          </p>
        </Reveal>

        <Reveal delay={500}>
          <p className="mt-12 text-sm font-medium uppercase tracking-wide text-white/60">
            Built for HVAC · Plumbing · Electrical · Cleaning · Landscaping crews
          </p>
        </Reveal>
      </div>
    </section>
  );
}
