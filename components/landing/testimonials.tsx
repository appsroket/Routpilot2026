import { Reveal } from "./reveal";

/* TODO: replace with real customer testimonials before publishing */
const TESTIMONIALS = [
  {
    quote:
      "We were losing a full afternoon a week to backtracking. First month on RoutePilot my two crews picked up 6 extra jobs without working longer.",
    initials: "MD",
    name: "Mike D.",
    detail: "HVAC · Austin, TX",
  },
  {
    quote:
      "Setup took me one coffee. Now I just paste the day and text the routes out before 7am.",
    initials: "SL",
    name: "Sarah L.",
    detail: "Cleaning Co. · Denver, CO",
  },
  {
    quote:
      "My drivers stopped calling to ask what's next. The text has the whole day in order, so they just drive it.",
    initials: "CM",
    name: "Carlos M.",
    detail: "Plumbing · Phoenix, AZ",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            What Crews Say After the First Month
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <blockquote className="flex-1 text-base leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.detail}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
