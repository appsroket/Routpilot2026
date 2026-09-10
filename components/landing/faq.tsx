"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const FAQS = [
  {
    q: "Do my technicians need to install an app?",
    a: "No. They get a text with a tap-to-navigate link. Nothing to download, nothing to log into.",
  },
  {
    q: "How is this different from just using Google Maps?",
    a: "Maps routes one trip at a time. RoutePilot orders your entire day across every technician and shows you the hours and dollars you saved doing it.",
  },
  {
    q: "How long does setup take?",
    a: "Minutes. Add your crew, add your jobs, click Optimize. You'll send your first optimized route today.",
  },
  {
    q: "What if I need to change the route?",
    a: "Drag any stop to reorder it and re-send in one tap. You're always in control.",
  },
  {
    q: "Will this work for my trade?",
    a: "If your crew drives between jobs — HVAC, plumbing, electrical, cleaning, landscaping — it works.",
  },
  {
    q: "How much does it cost?",
    a: "$99/mo with a free trial. It pays for itself the first time it saves a tech an hour. Cancel anytime.",
  },
];

function FaqItem({
  q,
  a,
  open,
  onToggle,
  id,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-button`}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        >
          <span className="font-heading text-lg font-semibold text-foreground">{q}</span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
              open && "rotate-180 text-primary",
            )}
            aria-hidden
          />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-base leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="text-center font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Questions, Answered
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 60}>
              <FaqItem
                id={`faq-${i}`}
                q={faq.q}
                a={faq.a}
                open={openIndex === i}
                onToggle={() => setOpenIndex((prev) => (prev === i ? null : i))}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
