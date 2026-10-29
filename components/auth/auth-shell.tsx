import React from "react";
import Link from "next/link";

export interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-surface-canvas text-white flex flex-col lg:flex-row overflow-x-hidden selection:bg-white/20 selection:text-white">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-3xl translate-y-1/3" />
      </div>

      {/* LEFT / BRAND PANEL (Desktop 5/12, Mobile top banner) */}
      <div className="relative z-10 w-full lg:w-5/12 xl:w-4/12 bg-surface-panel border-b lg:border-b-0 lg:border-r border-white/[0.08] p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-8">
        {/* Specular hairline */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-surface-card border border-white/[0.12] flex items-center justify-center text-white font-mono font-bold text-xs tracking-tight shadow-md group-hover:border-white/[0.24] transition-all duration-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg tracking-tight">CloseVDS</span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">Acquisition OS</span>
            </div>
          </Link>

          <div className="space-y-3 pt-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous Engine 2.4</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Find. Qualify.<br />Reach. Close.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              The unified operating system for B2B client acquisition. High-intent prospect discovery, deterministic opportunity auditing, and governed cold outreach.
            </p>
          </div>
        </div>

        {/* Informational Enterprise Architecture Safeguards */}
        <div className="hidden lg:block space-y-4 pt-8 border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider">
              Enterprise Safeguards
            </p>
            <span className="text-[10px] font-mono text-emerald-400/90 font-medium">Verified Active</span>
          </div>
          <div className="space-y-3.5">
            <div className="flex items-start space-x-3 group">
              <div className="w-5 h-5 rounded-md bg-surface-card border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-zinc-200">Human-in-the-Loop Gate</p>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Every outbound email & cold call requires explicit operator sign-off before dispatch.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="w-5 h-5 rounded-md bg-surface-card border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-zinc-200">Deterministic Fact Grounding</p>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Synthesis models generate personalization strictly anchored in crawled company data.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="w-5 h-5 rounded-md bg-surface-card border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5 text-zinc-300">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-zinc-200">Sovereign Data Isolation</p>
                <p className="text-zinc-500 text-[11px] leading-relaxed">
                  Workspace isolation with strict tenant boundaries and secure credential storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>CloseVDS OS 2.4</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Infrastructure Secure
          </span>
        </div>
      </div>

      {/* RIGHT / FORM PANEL */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
