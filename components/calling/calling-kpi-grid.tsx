"use client";

import React from "react";
import { VoiceAnalyticsData } from "@/types/calling";
import { formatCallDuration } from "@/lib/mappers";

export interface CallingKpiGridProps {
  analytics?: VoiceAnalyticsData | null;
  queuedCount?: number;
  approvalRequiredCount?: number;
  callsTodayCount?: number;
  isLoading?: boolean;
}

export function CallingKpiGrid({
  analytics,
  queuedCount = 0,
  approvalRequiredCount = 0,
  callsTodayCount = 0,
  isLoading = false,
}: CallingKpiGridProps) {
  const totalCalls = analytics?.totalCalls || 0;
  const completedCalls = analytics?.byStatus?.COMPLETED || 0;
  const meetings = analytics?.meetingsRequested || 0;
  const callbacks = analytics?.callbacksRequested || 0;
  const optOuts = analytics?.optOutCount || 0;
  const avgDuration = analytics?.averageDurationSeconds || 0;

  // Real metric calculations
  const connectRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  const conversionRate = totalCalls > 0 ? Math.round((meetings / totalCalls) * 100) : 0;
  const optOutRate = totalCalls > 0 ? Math.round((optOuts / totalCalls) * 100) : 0;

  const primaryKpis = [
    {
      label: "Calls Today",
      value: callsTodayCount,
      subtext: "Initiated or queued today",
      color: "text-white",
      badgeColor: "bg-white",
    },
    {
      label: "Calls Queued",
      value: queuedCount,
      subtext: "Pre-flight outbound queue",
      color: queuedCount > 0 ? "text-violet-400" : "text-zinc-300",
      badgeColor: queuedCount > 0 ? "bg-[#7D39EB]" : "bg-zinc-600",
    },
    {
      label: "Awaiting Review",
      value: approvalRequiredCount,
      subtext: "Human approval required",
      color: approvalRequiredCount > 0 ? "text-amber-400 font-bold" : "text-zinc-300",
      badgeColor: approvalRequiredCount > 0 ? "bg-amber-400" : "bg-zinc-600",
      highlight: approvalRequiredCount > 0,
    },
    {
      label: "Calls Completed",
      value: completedCalls,
      subtext: `Total lifetime: ${totalCalls}`,
      color: completedCalls > 0 ? "text-[#C6FF33]" : "text-zinc-300",
      badgeColor: completedCalls > 0 ? "bg-[#C6FF33]" : "bg-zinc-600",
    },
    {
      label: "Connect Rate",
      value: `${connectRate}%`,
      subtext: "Connected vs initiated",
      color: connectRate >= 40 ? "text-[#C6FF33]" : "text-white",
      badgeColor: connectRate >= 40 ? "bg-[#C6FF33]" : "bg-white",
    },
  ];

  const secondaryKpis = [
    {
      label: "Meetings Booked",
      value: meetings,
      subtext: "Direct demo conversions",
      color: meetings > 0 ? "text-[#C6FF33]" : "text-zinc-400",
    },
    {
      label: "Callback Requests",
      value: callbacks,
      subtext: "Scheduled CRM follow-ups",
      color: callbacks > 0 ? "text-[#A78BFA]" : "text-zinc-400",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      subtext: "Calls converted to meetings",
      color: conversionRate > 0 ? "text-[#C6FF33]" : "text-zinc-300",
    },
    {
      label: "Opt-Out Rate",
      value: `${optOutRate}%`,
      subtext: `${optOuts} prospect opt-outs`,
      color: optOuts > 0 ? "text-rose-400" : "text-zinc-400",
    },
    {
      label: "Avg Call Duration",
      value: formatCallDuration(avgDuration),
      subtext: "Conversation runtime",
      color: "text-zinc-200",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Operating Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block">
            Primary Calling Operations
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Live Telemetry
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {primaryKpis.map((kpi, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all duration-150 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)] ${
                kpi.highlight
                  ? "bg-[#140e09] border-amber-500/30 hover:border-amber-500/50"
                  : "bg-surface-card border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-card-hover"
              }`}
            >
              {/* Hairline highlight */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider truncate font-medium">
                  {kpi.label}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${kpi.badgeColor} shrink-0`} />
              </div>
              <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${kpi.color}`}>
                {isLoading ? "—" : kpi.value}
              </div>
              <div className="text-[11px] text-zinc-400 truncate mt-1">{kpi.subtext}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Outcomes */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block mb-2 px-0.5">
          Outcomes &amp; Conversion Telemetry
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {secondaryKpis.map((kpi, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150 relative overflow-hidden shadow-xs"
            >
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider truncate mb-1">
                {kpi.label}
              </div>
              <div className={`text-xl font-bold font-mono tabular-nums tracking-tight ${kpi.color}`}>
                {isLoading ? "—" : kpi.value}
              </div>
              <div className="text-[10px] text-zinc-400/80 truncate mt-1">{kpi.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
