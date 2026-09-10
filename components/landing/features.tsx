import {
  Route,
  MessageSquareText,
  Map,
  BarChart3,
  Zap,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "./reveal";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Route,
    title: "Every Stop in the Perfect Order",
    body: "One click reorders the whole day into the shortest possible drive. No more guessing the sequence.",
  },
  {
    icon: MessageSquareText,
    title: "Your Tech Gets the Route by Text",
    body: "No app to install. They tap the link and navigate turn-by-turn in order.",
  },
  {
    icon: Map,
    title: "The Whole Day on One Map",
    body: "See every job as a pin. Drag any stop to override the route in seconds.",
  },
  {
    icon: BarChart3,
    title: "Know Exactly What You Saved",
    body: "A live dashboard shows miles, hours, and dollars recovered this week and month.",
  },
  {
    icon: Zap,
    title: "Set Up in Minutes",
    body: "Add your crew, drop in the day's jobs, hit Optimize. That's the workflow.",
  },
  {
    icon: Wrench,
    title: "Fits Any Trade",
    body: "HVAC, plumbing, electrical, cleaning, landscaping — any crew that drives between jobs.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Everything You Need to Run a Tighter Route
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
