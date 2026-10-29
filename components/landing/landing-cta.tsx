import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-20 md:py-28 border-t border-white/[0.08] relative bg-surface-panel overflow-hidden">
      {/* Specular hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-white/[0.10] text-[11px] font-mono text-zinc-300 shadow-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>SOVEREIGN DEPLOYMENT READY</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Initialize your autonomous client acquisition engine today.
        </h2>

        <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Upgrade your B2B revenue operations with deterministic prospecting, verified AI opportunity audits, and governed outbound campaigns.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-6 font-semibold flex items-center justify-center gap-2 shadow-md"
            >
              <span>Launch Workspace</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-6 font-medium text-zinc-200"
            >
              Create Workspace
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-5 font-medium text-zinc-400 hover:text-white"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-500 font-mono">
          <span>Instant Setup</span>
          <span>•</span>
          <span>Sovereign Data Storage</span>
          <span>•</span>
          <span>No Unverified Claims</span>
        </div>
      </div>
    </section>
  );
}
