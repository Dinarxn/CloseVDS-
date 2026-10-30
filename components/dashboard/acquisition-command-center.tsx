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
      className="p-5 md:p-6 bg-surface-panel border border-white/[0.08] relative overflow-hidden shadow-xs"
    >
      {/* Specular Top Hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Top Header & CTAs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="violet" size="sm" className="font-mono text-[9px] uppercase tracking-wider">
                Command Center
              </Badge>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-card border border-white/[0.08] text-[10px] font-mono text-[#8E8E9F]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#565668]" />
                <span>closeBDS • Not Connected</span>
              </div>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              Build your acquisition pipeline
            </h2>
            <p className="text-xs md:text-sm text-[#8E8E9F] leading-relaxed">
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
                <svg className="w-3.5 h-3.5 text-[#CBCBD6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="text-[10px] font-mono text-[#8E8E9F] uppercase tracking-wider">
              Acquisition Data Flow
            </span>
            <span className="text-[10px] font-mono text-[#8E8E9F]">
              closeBDS connection will be configured later
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.name}
                className={`p-2.5 rounded-lg border transition-all duration-150 relative ${
                  idx === 0
                    ? "bg-surface-card border-white/[0.06] opacity-75"
                    : "bg-surface-card border-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono text-[#8E8E9F] mb-1">
                  <span>0{idx + 1}</span>
                  {idx < steps.length - 1 && (
                    <span className="text-[#565668] hidden lg:inline font-mono">→</span>
                  )}
                </div>
                <p className="text-xs font-bold text-white tracking-tight">
                  {step.name}
                </p>
                <p className="text-[10px] font-mono text-[#8E8E9F] truncate mt-0.5">
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
