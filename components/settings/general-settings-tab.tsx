"use client";

import React from "react";
import { GeneralSettingsConfig } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface GeneralSettingsTabProps {
  general: GeneralSettingsConfig;
  onChange: (field: keyof GeneralSettingsConfig, value: unknown) => void;
}

export function GeneralSettingsTab({
  general,
  onChange,
}: GeneralSettingsTabProps) {
  return (
    <div className="space-y-5">
      {/* 1. Workspace Profile */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" aria-hidden="true" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Workspace Profile
            </h4>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">IDENTITY &amp; ROUTING</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="settings-workspace-name"
            label="Acquisition Workspace Name"
            value={general.workspaceName}
            onChange={(e) => onChange("workspaceName", e.target.value)}
            helperText="The identifier for this client acquisition instance."
          />

          <Input
            id="settings-operator-email"
            label="Primary Operator Email"
            type="email"
            value={general.operatorEmail}
            onChange={(e) => onChange("operatorEmail", e.target.value)}
            helperText="Receives high-priority notifications when prospect replies occur."
          />
        </div>
      </div>

      {/* 2. Operator Alert Preferences */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" aria-hidden="true" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Operator Alert Preferences
            </h4>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">DISPATCH NOTIFICATIONS</span>
        </div>

        <div className="space-y-3.5">
          <Checkbox
            id="settings-notify-reply"
            label="Alert when a prospect replies to an outbound interaction"
            checked={general.notifyOnReply}
            onChange={(e) => onChange("notifyOnReply", typeof e === "boolean" ? e : (e as unknown as React.ChangeEvent<HTMLInputElement>).target?.checked ?? Boolean(e))}
            description="Real-time operator notification triggered upon prospect email or voice reply."
          />

          <Checkbox
            id="settings-notify-meeting"
            label="Alert when a prospect requests or books a discovery call"
            checked={general.notifyOnMeeting}
            onChange={(e) => onChange("notifyOnMeeting", typeof e === "boolean" ? e : (e as unknown as React.ChangeEvent<HTMLInputElement>).target?.checked ?? Boolean(e))}
            description="Immediate notification dispatched when a meeting request or calendar event is booked."
          />

          <Checkbox
            id="settings-notify-safety"
            label="Alert if bounce rate or spam report thresholds are approached"
            checked={general.notifyOnSafetyAlert}
            onChange={(e) => onChange("notifyOnSafetyAlert", typeof e === "boolean" ? e : (e as unknown as React.ChangeEvent<HTMLInputElement>).target?.checked ?? Boolean(e))}
            description="Proactive safety alerts dispatched when deliverability telemetry approaches warning thresholds."
          />
        </div>
      </div>
    </div>
  );
}