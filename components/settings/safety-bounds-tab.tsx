"use client";

import React from "react";
import { SafetyLimitsConfig } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface SafetyBoundsTabProps {
  safety: SafetyLimitsConfig;
  onChange: (field: keyof SafetyLimitsConfig, value: unknown) => void;
  onOpenKillSwitch: () => void;
}

export function SafetyBoundsTab({
  safety,
  onChange,
  onOpenKillSwitch,
}: SafetyBoundsTabProps) {
  const isKillSwitchActive = safety.globalKillSwitchActive;

  return (
    <div className="space-y-5">
      {/* 1. Emergency Global Kill Switch — Highest Priority */}
      <div
        className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 ${
          isKillSwitchActive
            ? "bg-rose-950/25 border-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.15)]"
            : "bg-surface-card border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
        }`}
      >
        <div
          className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${
            isKillSwitchActive ? "via-rose-500/50" : "via-white/[0.10]"
          } to-transparent`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 ${isKillSwitchActive ? "text-rose-400" : "text-zinc-400"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  Emergency Global Kill Switch
                </h4>
              </div>

              <span
                className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${
                  isKillSwitchActive
                    ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                    : "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isKillSwitchActive ? "bg-rose-400 animate-pulse" : "bg-[#C6FF33]"
                  }`}
                />
                {isKillSwitchActive ? "ACTIVE — SENDING HALTED" : "INACTIVE — NORMAL"}
              </span>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed font-sans">
              Instantly halt all outbound outreach dispatches, sequence progression, and follow-up sending across the entire workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenKillSwitch}
            className={`h-9 px-4 rounded-lg text-xs font-semibold shrink-0 transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer ${
              isKillSwitchActive
                ? "bg-white text-zinc-950 hover:bg-zinc-100"
                : "border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/60"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${isKillSwitchActive ? "text-zinc-950" : "text-rose-400"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
            </svg>
            <span>{isKillSwitchActive ? "Deactivate Kill Switch" : "Activate Emergency Kill Switch"}</span>
          </button>
        </div>
      </div>

      {/* 2. Outreach Velocity & Daily Caps */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Outreach Velocity &amp; Daily Caps
            </h4>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">OPERATIONAL LIMITS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="safety-daily-cap"
            label="Daily Max Outreach Cap"
            type="number"
            value={safety.dailyOutreachCap.toString()}
            onChange={(e) => onChange("dailyOutreachCap", parseInt(e.target.value, 10) || 0)}
            helperText="Hard ceiling on total outbound dispatches across all active operations (MVP max 50)."
          />

          <Input
            id="safety-delay-sec"
            label="Dispatch Delay Interval (Seconds)"
            type="number"
            value={safety.dispatchDelaySeconds.toString()}
            onChange={(e) => onChange("dispatchDelaySeconds", parseInt(e.target.value, 10) || 0)}
            helperText="Randomized jitter spacing between individual dispatches to prevent burst flagging."
          />
        </div>
      </div>

      {/* 3. Timezone & Delivery Windows */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Timezone &amp; Delivery Windows
            </h4>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">SCHEDULING CONTROLS</span>
        </div>

        <div className="space-y-4">
          <Checkbox
            id="safety-biz-hours"
            label="Enforce Recipient Business Hours Delivery Only"
            checked={safety.businessHoursOnly}
            onChange={(e) => onChange("businessHoursOnly", e.target.checked)}
            description="Dispatches will only be sent between 9:00 AM and 5:00 PM in the target recipient's local timezone."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              id="safety-window-start"
              label="Window Start Time"
              type="time"
              value={safety.sendingWindowStart}
              onChange={(e) => onChange("sendingWindowStart", e.target.value)}
            />

            <Input
              id="safety-window-end"
              label="Window End Time"
              type="time"
              value={safety.sendingWindowEnd}
              onChange={(e) => onChange("sendingWindowEnd", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 4. Phase 1 Safety Configuration Governance Panel */}
      <div className="relative overflow-hidden rounded-xl bg-surface-panel border border-white/[0.07] p-4 flex items-start gap-3 text-xs shadow-xs">
        <div className="p-1.5 rounded-lg bg-surface-elevated border border-white/[0.08] text-zinc-400 shrink-0 mt-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="space-y-1">
          <h5 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            Safety Configuration Governance
          </h5>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            These safety bounds govern the dispatch orchestration queue. Values are currently held in workspace configuration state and bind directly to the deliverability rate limiter.
          </p>
        </div>
      </div>
    </div>
  );
}