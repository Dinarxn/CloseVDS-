"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card variant="standard" className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Autonomous Safety &amp; Compliance Enclosure</CardTitle>
          <Badge variant="success" size="sm" dot>
            Guardrails Active
          </Badge>
        </div>
        <CardDescription>
          Multi-layer server-enforced safety gates evaluated before every voice preparation and dispatch.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {killSwitchActive && (
          <Alert variant="destructive" title="Global Kill Switch Active">
            Calling is currently disabled by the safety system. All outbound telephony operations, dispatches, and scheduling are blocked.
          </Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Kill Switch */}
          <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-mono font-medium truncate">
              Kill Switch
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${killSwitchActive ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate">
                {killSwitchActive ? "ACTIVE" : "STANDBY"}
              </span>
            </div>
          </div>

          {/* 2. Approval */}
          <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-mono font-medium truncate">
              Approval Gate
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate">
                {humanApprovalRequired ? "MANDATORY" : "OPTIONAL"}
              </span>
            </div>
          </div>

          {/* 3. Suppression */}
          <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-mono font-medium truncate">
              Suppression
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate">
                {suppressedPhoneCount > 0 ? `${suppressedPhoneCount} Phones` : "Active"}
              </span>
            </div>
          </div>

          {/* 4. Daily Cap */}
          <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-mono font-medium truncate">
              Daily Limit
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
              <span className="text-xs font-semibold text-white tabular-nums whitespace-nowrap truncate">
                {dailyCap} Calls Max
              </span>
            </div>
          </div>

          {/* 5. Window */}
          <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-mono font-medium truncate">
              Calling Window
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-white tabular-nums whitespace-nowrap truncate">
                {callingWindow}
              </span>
            </div>
          </div>

          {/* 6. Telephony Link */}
          <div className="p-3 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between hover:border-white/[0.12] transition-colors">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-mono font-medium truncate">
              Telephony Link
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${providerConfigured ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-xs font-semibold text-white tracking-wide whitespace-nowrap truncate">
                {providerConfigured ? "READY" : "LOCKED"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
