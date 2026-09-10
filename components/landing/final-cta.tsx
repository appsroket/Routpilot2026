import { ArrowRight, CalendarDays } from "lucide-react";

import { Reveal } from "./reveal";
import { CtaLink } from "./cta";
import { SIGNUP_HREF, DEMO_HREF } from "./constants";

export function FinalCta() {
  return (
    <section className="px-6 py-24 md:py-32">
      <Reveal>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#4338ca] p-10 text-center text-white shadow-xl md:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-0 h-56 w-[520px] max-w-[90%] -translate-x-1/2 rounded-full bg-white/15 blur-[120px]"
          />
          <h2 className="relative z-10 font-heading text-4xl font-bold tracking-tight text-white md:text-5xl">
            See What You&apos;d Save This Month
          </h2>
          <p className="relative z-10 mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/80">
            $99/mo. If RoutePilot saves one tech a single hour a week, it&apos;s
            already paid for itself twice over.
          </p>

          <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              <CalendarDays className="size-4" />
              Book a 15-min demo
            </CtaLink>
          </div>

          <p className="relative z-10 mt-5 text-sm text-white/70">
            Free trial · No card to start · Cancel anytime
          </p>
        </div>
      </Reveal>
    </section>
  );
}
