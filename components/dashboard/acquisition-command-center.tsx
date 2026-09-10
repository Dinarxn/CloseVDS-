"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AcquisitionCommandCenter() {
  const steps = [
    { name: "DISCOVER", sub: "closeBDS", active: false },
    { name: "IMPORT / SYNC", sub: "closeVDS", active: true },
    { name: "RESEARCH", sub: "Audit & Stack", active: true },
    { name: "QUALIFY", sub: "ICP Fit", active: true },
    { name: "AI CALL", sub: "Human Gated", active: true },
    { name: "CONVERT", sub: "CRM Deal", active: true },
  ];

  return (
    <Card
      variant="elevated"
      className="p-5 md:p-6 bg-gradient-to-br from-[#121218] via-[#14141f] to-[#0f0f16] border border-white/[0.1] relative overflow-hidden"
    >
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-6">
        {/* Top Header & CTAs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="solid" size="sm" className="font-mono text-[9px] uppercase tracking-wider">
                Command Center
              </Badge>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/[0.08] text-[10px] font-mono text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>closeBDS • Not Connected</span>
              </div>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Build your acquisition pipeline
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              Discover prospects with closeBDS, qualify them with closeVDS intelligence, and route approved prospects into AI calling.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/leads">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Open Leads</span>
              </Button>
            </Link>
            <Link href="/calling">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span>Open AI Calling</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Acquisition Data Flow
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              closeBDS connection will be configured later
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.name}
                className={`p-2.5 rounded-lg border transition-all duration-150 relative ${
                  idx === 0
                    ? "bg-[#101017] border-white/[0.06] opacity-75"
                    : "bg-[#13131d] border-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 mb-1">
                  <span>0{idx + 1}</span>
                  {idx < steps.length - 1 && (
                    <span className="text-zinc-600 hidden lg:inline font-mono">→</span>
                  )}
                </div>
                <p className="text-xs font-bold text-zinc-200 tracking-tight">
                  {step.name}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                  {step.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
