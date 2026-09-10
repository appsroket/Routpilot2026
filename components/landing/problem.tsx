import { Clock, MapPinned, Fuel, Layers, type LucideIcon } from "lucide-react";

import { Reveal } from "./reveal";

const PAINS: { icon: LucideIcon; text: string }[] = [
  {
    icon: Clock,
    text: "Your best tech spends 90 minutes a day crisscrossing town between jobs.",
  },
  {
    icon: MapPinned,
    text: "Two jobs land on opposite ends of the city on the same afternoon — and nobody caught it.",
  },
  {
    icon: Fuel,
    text: "You find out about the wasted miles when the fuel card bill shows up.",
  },
  {
    icon: Layers,
    text: "Reordering the day means squinting at Google Maps across five browser tabs.",
  },
];

export function Problem() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            You Already Know Where the Money Goes
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PAINS.map(({ icon: Icon, text }, i) => (
            <Reveal key={text} delay={i * 90}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <p className="text-base leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-foreground">
            Every one of those minutes is an hour you could have billed. RoutePilot
            gets them back.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
