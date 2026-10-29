import React from "react";

export function AnalyticsEmptyState() {
  return (
    <div className="relative p-8 sm:p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
      <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400 shadow-xs">
        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
          Analytics Telemetry
        </span>
        <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
          Zero Acquisition Records
        </h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
          Analytics metrics, conversion rates, and pipeline performance charts will populate automatically once real lead discovery and permission-gated outreach workflows are executed.
        </p>
      </div>
    </div>
  );
}
