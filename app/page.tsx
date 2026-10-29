import React from "react";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPipeline } from "@/components/landing/landing-pipeline";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingArchitecture } from "@/components/landing/landing-architecture";
import { LandingSpecs } from "@/components/landing/landing-specs";
import { LandingCTA } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata = {
  title: "CloseVDS — AI Client Acquisition Operating System",
  description:
    "The unified autonomous operating system for B2B client acquisition. High-intent prospect discovery, deterministic opportunity auditing, governed cold outreach, and closed-loop deal acceleration.",
};

export default function RootPage() {
  return (
    <div className="min-h-screen bg-surface-canvas text-white selection:bg-white/20 selection:text-white flex flex-col font-sans">
      {/* Navigation Header */}
      <LandingNavbar />

      {/* Main Landing Flow */}
      <main className="flex-1">
        {/* 1. Hero with Interactive Telemetry Viewport */}
        <LandingHero />

        {/* 2. 4-Stage Autonomous Pipeline */}
        <LandingPipeline />

        {/* 3. Core System Capabilities */}
        <LandingFeatures />

        {/* 4. Enterprise Architecture & Safety Safeguards */}
        <LandingArchitecture />

        {/* 5. Empirical Technical Specs & Guarantees */}
        <LandingSpecs />

        {/* 6. Closing Conversion CTA */}
        <LandingCTA />
      </main>

      {/* Enterprise Platform Footer */}
      <LandingFooter />
    </div>
  );
}
