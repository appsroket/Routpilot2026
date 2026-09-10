"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";

import { CtaLink } from "./cta";
import { Reveal } from "./reveal";
import { SIGNUP_HREF } from "./constants";
import { useTween } from "./use-tween";
import { formatInt } from "./format";

const PRICE = 99;

type SliderProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
};

function Slider({ id, label, min, max, step = 1, value, display, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </label>
        <span className="font-heading text-base font-semibold text-foreground">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[#5a2fda] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      />
    </div>
  );
}

export function RoiCalculator() {
  const [techs, setTechs] = React.useState(4);
  const [hoursSaved, setHoursSaved] = React.useState(1);
  const [rate, setRate] = React.useState(150);
  const [days, setDays] = React.useState(22);

  const hours = techs * hoursSaved * days;
  const value = hours * rate;
  const multiple = Math.max(1, Math.round(value / PRICE));

  const hoursShown = useTween(hours);
  const valueShown = useTween(value);
  const multipleShown = useTween(multiple);

  return (
    <section id="roi" className="scroll-mt-24 overflow-hidden px-6 py-24 md:py-32">
      <div className="relative mx-auto max-w-4xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-64 rounded-full bg-primary/10 blur-[120px]"
        />
        <Reveal>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl md:p-12">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              See What Drive Time Is Costing You
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
              Move the sliders. This is money your crew is leaving on the road every
              month.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
            <Slider
              id="roi-techs"
              label="Number of technicians"
              min={1}
              max={20}
              value={techs}
              display={String(techs)}
              onChange={setTechs}
            />
            <Slider
              id="roi-hours"
              label="Hours saved per tech / day"
              min={0.5}
              max={3}
              step={0.5}
              value={hoursSaved}
              display={`${hoursSaved.toFixed(1)} hrs`}
              onChange={setHoursSaved}
            />
            <Slider
              id="roi-rate"
              label="Technician billable rate"
              min={75}
              max={300}
              step={5}
              value={rate}
              display={`$${rate}/hr`}
              onChange={setRate}
            />
            <Slider
              id="roi-days"
              label="Working days per month"
              min={15}
              max={26}
              value={days}
              display={`${days} days`}
              onChange={setDays}
            />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary p-6 text-center">
              <p className="text-sm text-muted-foreground">Billable hours recovered / month</p>
              <p className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                {formatInt(hoursShown)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary p-6 text-center">
              <p className="text-sm text-muted-foreground">Value recovered / month</p>
              <p className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
                ${formatInt(valueShown)}
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-lg text-foreground">
            RoutePilot costs{" "}
            <span className="font-semibold">${PRICE}/mo</span>. That&apos;s a{" "}
            <span className="font-heading font-bold text-primary">
              {formatInt(multipleShown)}×
            </span>{" "}
            return.
          </p>

          <div className="mt-8 flex justify-center">
            <CtaLink href={SIGNUP_HREF} className="w-full sm:w-auto">
              Start Free Trial
              <ArrowRight className="size-4" />
            </CtaLink>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
