"use client";

import React from "react";

export interface SafetyShieldProps {
  gatesCount?: number;
  status?: "healthy" | "warning" | "error";
  description?: string;
  className?: string;
}

export function SafetyShield({
  gatesCount = 18,
  status = "healthy",
  description = "Anti-hallucination grounded context enforced.",
  className = "",
}: SafetyShieldProps) {
  const statusConfig = {
    healthy: {
      label: `${gatesCount} GATES`,
      dotClass: "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.5)]",
      textClass: "text-[#C6FF33]",
      barClass: "bg-[#C6FF33]",
      badgeBorder: "border-[#C6FF33]/25 bg-[#C6FF33]/10",
    },
    warning: {
      label: "DEGRADED",
      dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
      textClass: "text-amber-400",
      barClass: "bg-amber-400",
      badgeBorder: "border-amber-500/25 bg-amber-500/10",
    },
    error: {
      label: "GATE FAILED",
      dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
      textClass: "text-rose-400",
      barClass: "bg-rose-500",
      badgeBorder: "border-rose-500/30 bg-rose-500/10",
    },
  };

  const current = statusConfig[status];

  return (
    <div
      role="region"
      aria-label="Safety Shield Status"
      className={`relative mx-0.5 p-2.5 rounded-xl bg-surface-card border border-white/[0.08] space-y-2 text-left shadow-xs overflow-hidden ${className}`}
    >
      {/* Specular hairline top reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span className="text-zinc-400 uppercase tracking-wider font-semibold">Safety Shield</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded-full font-semibold border flex items-center gap-1.5 tracking-wide ${current.badgeBorder} ${current.textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dotClass}`} />
          <span>{current.label}</span>
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 leading-snug font-sans">
        {description}
      </p>

      {/* Calibration status track */}
      <div className="w-full h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full w-full ${current.barClass}`} />
      </div>
    </div>
  );
}

