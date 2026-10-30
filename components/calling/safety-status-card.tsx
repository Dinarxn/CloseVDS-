"use client";

import React from "react";
import { Alert } from "@/components/ui/alert";

export interface SafetyStatusCardProps {
  killSwitchActive?: boolean;
  humanApprovalRequired?: boolean;
  suppressedPhoneCount?: number;
  dailyCap?: number;
  callingWindow?: string;
  providerConfigured?: boolean;
}

export function SafetyStatusCard({
  killSwitchActive = false,
  humanApprovalRequired = true,
  suppressedPhoneCount = 0,
  dailyCap = 25,
  callingWindow = "09:00 - 17:00",
  providerConfigured = false,
}: SafetyStatusCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] hover:border-white/[0.14] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-colors">
      {/* Top hairline highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white tracking-tight">Autonomous Safety &amp; Compliance Enclosure</h3>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/25 font-semibold inline-flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#C6FF33]" />
            Guardrails Active
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          Multi-layer server-enforced safety gates evaluated before every voice preparation and dispatch.
        </p>
      </div>

      <div className="space-y-4">
        {killSwitchActive && (
          <Alert variant="destructive" title="Global Kill Switch Active">
            Calling is currently disabled by the safety system. All outbound telephony operations, dispatches, and scheduling are blocked.
          </Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Kill Switch */}
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-xs">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-mono font-medium truncate">
              Kill Switch
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${killSwitchActive ? "bg-rose-500 animate-ping" : "bg-[#C6FF33]"}`} />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate font-mono">
                {killSwitchActive ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
          </div>

          {/* 2. Approval */}
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-xs">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-mono font-medium truncate">
              Approval Gate
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shrink-0" />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate font-mono">
                {humanApprovalRequired ? "MANDATORY" : "OPTIONAL"}
              </span>
            </div>
          </div>

          {/* 3. Suppression */}
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-xs">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-mono font-medium truncate">
              Suppression
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate font-mono">
                {suppressedPhoneCount > 0 ? `${suppressedPhoneCount} Phones` : "Active"}
              </span>
            </div>
          </div>

          {/* 4. Daily Cap */}
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-xs">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-mono font-medium truncate">
              Daily Limit
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="text-xs font-semibold text-white tabular-nums whitespace-nowrap truncate font-mono">
                {dailyCap} Calls Max
              </span>
            </div>
          </div>

          {/* 5. Window */}
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-xs">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-mono font-medium truncate">
              Calling Window
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-white tabular-nums whitespace-nowrap truncate font-mono">
                {callingWindow}
              </span>
            </div>
          </div>

          {/* 6. Telephony Link */}
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors shadow-xs">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-mono font-medium truncate">
              Telephony Link
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${providerConfigured ? "bg-[#C6FF33]" : "bg-amber-400"}`} />
              <span className="text-xs font-semibold text-white whitespace-nowrap truncate font-mono">
                {providerConfigured ? "TWILIO LINKED" : "UNCONFIGURED"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
