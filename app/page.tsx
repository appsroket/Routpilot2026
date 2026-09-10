import type { Metadata } from "next";

import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TradesMarquee } from "@/components/landing/trades-marquee";
import { RoiCalculator } from "@/components/landing/roi-calculator";
import { Problem } from "@/components/landing/problem";
import { Features } from "@/components/landing/features";
import { Stats } from "@/components/landing/stats";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FinalCta } from "@/components/landing/final-cta";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "RoutePilot — Turn wasted drive time into billable hours",
  description:
    "Route optimization for home service crews. RoutePilot builds the fastest route for every technician and texts it to their phone. Start a free trial.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TradesMarquee />
        <RoiCalculator />
        <Problem />
        <Features />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <FinalCta />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
