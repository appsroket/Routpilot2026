import { Reveal } from "./reveal";
import { Counter } from "./counter";

const STATS = [
  {
    value: 8.5,
    decimals: 1,
    suffix: " hrs",
    label: "drive time a 4-tech crew can recover in a single week",
  },
  {
    value: 23,
    suffix: "%",
    label: "fewer miles on an optimized multi-stop day",
  },
  {
    value: 3100,
    prefix: "$",
    label: "monthly billable value of one saved hour per tech (at $150/hr)",
  },
  {
    value: 60,
    prefix: "<",
    suffix: " sec",
    label: "to optimize a full day's route",
  },
];

export function Stats() {
  return (
    <section className="bg-gradient-to-br from-[#4c1d95] via-[#5b21b6] to-[#4338ca] px-6 py-24 text-white md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center font-heading text-4xl font-bold tracking-tight text-white md:text-5xl">
            The Math on One Saved Hour
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div className="text-center">
                <Counter
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  prefix={stat.prefix ?? ""}
                  suffix={stat.suffix ?? ""}
                  className="font-heading text-4xl font-extrabold tracking-tight text-cta md:text-5xl"
                />
                <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-relaxed text-white/70">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-12 text-center text-xs text-white/60">
            Figures are illustrative — the calculator above uses your real numbers.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
