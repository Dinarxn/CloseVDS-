"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LeadPreview {
  id: string;
  company: string;
  industry: string;
  fitScore: number;
  contact: string;
  role: string;
  painPoint: string;
  techStack: string[];
  status: "Verified" | "Audited" | "Queued";
}

const SAMPLE_LEADS: LeadPreview[] = [
  {
    id: "lead-1",
    company: "Apex Enterprise Cloud",
    industry: "DevOps & Infrastructure",
    fitScore: 98,
    contact: "Marcus Vance",
    role: "VP of Infrastructure",
    painPoint: "High outbound latency & ungrounded sales touchpoints",
    techStack: ["AWS", "Kubernetes", "PostgreSQL", "Next.js"],
    status: "Verified",
  },
  {
    id: "lead-2",
    company: "Nexus Financial Logic",
    industry: "Fintech & Compliance",
    fitScore: 94,
    contact: "Elena Rostova",
    role: "Chief Revenue Officer",
    painPoint: "Manual compliance audits & fragmented prospecting pipelines",
    techStack: ["Snowflake", "Databricks", "Stripe", "FastAPI"],
    status: "Audited",
  },
  {
    id: "lead-3",
    company: "Beacon Retail Systems",
    industry: "E-Commerce Supply Chain",
    fitScore: 91,
    contact: "David Chen",
    role: "Head of Growth",
    painPoint: "Stale CRM contact graphs & low cold email deliverability",
    techStack: ["Shopify Plus", "Segment", "BigQuery"],
    status: "Queued",
  },
];

export function LandingHero() {
  const [selectedLead, setSelectedLead] = useState<LeadPreview>(SAMPLE_LEADS[0]);
  const [isApproved, setIsApproved] = useState(false);

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Specular hairline at top of page */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-white/[0.025] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Sub-badge / telemetry indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-white/[0.10] text-[11px] font-mono text-zinc-300 shadow-sm mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wide">CLOSEVDS OS 2.4</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">Autonomous Client Acquisition Platform</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.08] max-w-5xl mx-auto">
          Find, qualify, reach, and close <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
            enterprise clients on autopilot.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
          The unified operating system for B2B revenue generation. Discover high-fit accounts, synthesize deterministic opportunity intelligence, orchestrate governed multichannel outreach, and accelerate closed deals.
        </p>

        {/* Action CTAs */}
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
          <Link href="/login" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto px-6 font-medium text-zinc-200"
            >
              Sign In
            </Button>
          </Link>
          <a href="#pipeline" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-5 font-medium text-zinc-400 hover:text-white"
            >
              Architecture &rarr;
            </Button>
          </a>
        </div>

        {/* 3 Core Trust Guarantees */}
        <div className="mt-10 pt-8 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white block">Deterministic Fact Grounding</span>
              <span className="text-zinc-500 text-[11px]">Zero hallucinated claims in copy</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white block">Human-in-the-Loop Safe</span>
              <span className="text-zinc-500 text-[11px]">Mandatory operator sign-off gate</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-white block">Sovereign Data Isolation</span>
              <span className="text-zinc-500 text-[11px]">Private tenant data boundaries</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE DASHBOARD TELEMETRY VIEWPORT */}
        <div className="mt-14 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-white/[0.10] bg-surface-panel p-2 sm:p-3 shadow-[0_24px_80px_rgba(0,0,0,0.9)] relative overflow-hidden text-left">
            {/* Top window specular edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent pointer-events-none" />

            {/* Mock Window Title Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-surface-card/60 rounded-t-xl mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-700/80 inline-block" />
                <span className="text-[11px] font-mono text-zinc-400 ml-2">closevds-os // live-pipeline-telemetry</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME PIPELINE STREAM
                </span>
                <span className="text-zinc-600">|</span>
                <span>LATENCY: 142ms</span>
              </div>
            </div>

            {/* 3-Column Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-1">
              {/* Column 1: Prospect Ingestion Stream (4 cols) */}
              <div className="lg:col-span-4 bg-surface-card rounded-xl border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        01. Discovery Stream
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">3 In Queue</span>
                  </div>

                  <div className="space-y-2">
                    {SAMPLE_LEADS.map((lead) => {
                      const isSelected = selectedLead.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsApproved(false);
                          }}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "bg-surface-elevated border-white/[0.22] shadow-sm"
                              : "bg-surface-panel/60 border-white/[0.04] hover:border-white/[0.12] hover:bg-surface-elevated/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white truncate">{lead.company}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-emerald-400 font-semibold">
                              {lead.fitScore}% Fit
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                            <span>{lead.contact}</span>
                            <span className="text-zinc-500 font-mono text-[10px]">{lead.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Deduplication: Active</span>
                  <span className="text-white">0 Duplicates</span>
                </div>
              </div>

              {/* Column 2: Grounded Opportunity Audit (4 cols) */}
              <div className="lg:col-span-4 bg-surface-card rounded-xl border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        02. Fact Audit & Synthesis
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Verified Grounding</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Account Under Audit</span>
                      <p className="font-bold text-white text-sm">{selectedLead.company}</p>
                      <p className="text-zinc-400 text-[11px]">{selectedLead.industry}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-panel border border-white/[0.06]">
                      <span className="text-[10px] font-mono text-zinc-400 block mb-1">
                        Synthesized Pain Point:
                      </span>
                      <p className="text-zinc-200 text-xs italic">
                        &quot;{selectedLead.painPoint}&quot;
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">
                        Detected Tech Stack
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLead.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded bg-surface-panel border border-white/[0.08] text-[10px] font-mono text-zinc-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Persona Grounding</span>
                  <span className="text-emerald-400">Deterministic</span>
                </div>
              </div>

              {/* Column 3: Governed Outreach & Approval Gate (4 cols) */}
              <div className="lg:col-span-4 bg-surface-card rounded-xl border border-white/[0.06] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        03. Governed Outbound Gate
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">Human Approval</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-surface-panel border border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Recipient: {selectedLead.contact}</span>
                        <span className="text-emerald-400 font-semibold">CAN-SPAM Safe</span>
                      </div>
                      <p className="text-zinc-200 text-xs leading-relaxed">
                        &quot;Noticed {selectedLead.company}&apos;s work with {selectedLead.techStack[0]}. CloseVDS helps resolve {selectedLead.painPoint.toLowerCase()} with sovereign pipeline automation.&quot;
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-300">
                        <span>Operator Sign-off Status:</span>
                        <span className={`font-mono text-xs font-semibold ${isApproved ? "text-emerald-400" : "text-amber-400"}`}>
                          {isApproved ? "APPROVED FOR SEND" : "PENDING HUMAN REVIEW"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsApproved(!isApproved)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-white text-zinc-950 hover:bg-zinc-100 border border-white/80 active:scale-[0.98]"
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Ready in Dispatch Queue</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Sign-off & Approve Campaign</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>Dispatch Limit: 50 / day</span>
                  <span className="text-zinc-300">Throttle Active</span>
                </div>
              </div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="mt-2 pt-2 pb-1 px-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
              <div className="flex items-center gap-4">
                <span>PIPELINE ENGINE: ONLINE</span>
                <span className="hidden sm:inline">DATA ENCRYPTION: TLS 1.3 / AES-256</span>
                <span>ZERO UNVERIFIED CLAIMS</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span>INTERACTIVE DEMO</span>
                <span>•</span>
                <Link href="/dashboard" className="text-white hover:underline">Open Live Workspace &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
