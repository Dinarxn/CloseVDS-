"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  ActivityIcon,
} from "@/components/ui/icons";
import type { OperationsSummary } from "@/types/operations";

export interface OperationsTelemetryProps {
  summary: OperationsSummary | null;
  queueCount: number;
  callReadyCount: number;
}

export function OperationsTelemetry({
  summary,
  queueCount,
  callReadyCount,
}: OperationsTelemetryProps) {
  const followUpsDue = summary?.followUpsDueCount ?? 0;
  const telephonyLive = summary?.systemHealth?.telephonyConfigured ?? false;
  const voiceAiLive = summary?.systemHealth?.voiceAiConfigured ?? false;
  const isSystemReady = telephonyLive && voiceAiLive;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Follow-ups Due */}
      <Card variant="standard" specular={true} className="p-4 bg-surface-card border-white/[0.08] transition-all duration-150 hover:border-white/[0.16]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <ClockIcon size={14} className="text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Follow-Ups Due
            </span>
          </div>
          {followUpsDue > 0 ? (
            <Badge variant="warning" size="sm" dot={true}>
              Action Due
            </Badge>
          ) : (
            <Badge variant="secondary" size="sm" dot={false}>
              Up to Date
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight tabular-nums">
            {followUpsDue}
          </span>
          <span className="text-xs text-zinc-400">commitments in CRM</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Priority Queue</span>
          <span className={followUpsDue > 0 ? "text-amber-400 font-medium" : "text-zinc-500"}>
            {followUpsDue > 0 ? "Requires Operator Touch" : "Zero Overdue"}
          </span>
        </div>
      </Card>

      {/* 2. Active Call Queue */}
      <Card variant="standard" specular={true} className="p-4 bg-surface-card border-white/[0.08] transition-all duration-150 hover:border-white/[0.16]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <PhoneIcon size={14} className="text-[#7D39EB]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Active Call Queue
            </span>
          </div>
          <Badge variant="brand" size="sm" dot={queueCount > 0}>
            {queueCount > 0 ? "Enqueued" : "Idle"}
          </Badge>
        </div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight tabular-nums">
            {queueCount}
          </span>
          <span className="text-xs text-zinc-400">calls pending dialer</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Outbound Engine</span>
          <span className={queueCount > 0 ? "text-[#B788FF] font-medium" : "text-zinc-500"}>
            {queueCount > 0 ? "Awaiting Auto-Dial" : "Queue Empty"}
          </span>
        </div>
      </Card>

      {/* 3. Call-Ready Prospects */}
      <Card variant="standard" specular={true} className="p-4 bg-surface-card border-white/[0.08] transition-all duration-150 hover:border-white/[0.16]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <CheckCircleIcon size={14} className="text-[#C6FF33]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Call-Ready
            </span>
          </div>
          <Badge variant="success" size="sm" dot={callReadyCount > 0}>
            Verified Safe
          </Badge>
        </div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold text-[#C6FF33] font-mono tracking-tight tabular-nums">
            {callReadyCount}
          </span>
          <span className="text-xs text-zinc-400">qualified &amp; approved</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Pre-Flight Screening</span>
          <span className="text-[#C6FF33] font-medium">Passed Step 20</span>
        </div>
      </Card>

      {/* 4. Operational Readiness */}
      <Card variant="standard" specular={true} className="p-4 bg-surface-card border-white/[0.08] transition-all duration-150 hover:border-white/[0.16]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <ActivityIcon size={14} className={isSystemReady ? "text-[#C6FF33]" : "text-amber-400"} />
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Dialer Readiness
            </span>
          </div>
          {isSystemReady ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#C6FF33]/15 text-[#C6FF33] border border-[#C6FF33]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] animate-pulse" />
              ONLINE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-950/30 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              ATTENTION
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-canvas border border-white/[0.06]">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                telephonyLive ? "bg-[#C6FF33]" : "bg-amber-400"
              }`}
            />
            <span className="text-[10px] font-mono text-zinc-300 truncate">
              {telephonyLive ? "Telephony Active" : "Telephony Unset"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-canvas border border-white/[0.06]">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                voiceAiLive ? "bg-[#C6FF33]" : "bg-amber-400"
              }`}
            />
            <span className="text-[10px] font-mono text-zinc-300 truncate">
              {voiceAiLive ? "Voice AI Active" : "Voice AI Unset"}
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Daily Volume</span>
          <span className="tabular-nums text-zinc-300">
            {summary?.systemHealth?.callsToday ?? 0} / {summary?.systemHealth?.dailyLimit ?? 100} Calls
          </span>
        </div>
      </Card>
    </div>
  );
}
