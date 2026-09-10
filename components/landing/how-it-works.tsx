import { Reveal } from "./reveal";

const STEPS = [
  {
    num: "01",
    title: "Add your crew and today's jobs",
    body: "Type them in or paste your list. Addresses autocomplete.",
  },
  {
    num: "02",
    title: "Hit Optimize",
    body: "RoutePilot builds the shortest route across every technician.",
  },
  {
    num: "03",
    title: "We text each tech their route",
    body: "They tap, navigate, and get through more jobs.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Three Steps to a Faster Day
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={i * 110}>
              <div>
                <span className="font-heading text-5xl font-extrabold tracking-tight text-primary">
                  {step.num}
                </span>
                <h3 className="mt-4 font-heading text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
