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
    },
    {
      label: "Calls Queued",
      value: queuedCount,
      subtext: "Pre-flight pipeline",
      color: queuedCount > 0 ? "text-sky-400" : "text-zinc-200",
    },
    {
      label: "Awaiting Review",
      value: approvalRequiredCount,
      subtext: "Human approval needed",
      color: approvalRequiredCount > 0 ? "text-amber-400 font-bold" : "text-zinc-200",
      highlight: approvalRequiredCount > 0,
    },
    {
      label: "Calls Completed",
      value: completedCalls,
      subtext: `Total lifetime: ${totalCalls}`,
      color: completedCalls > 0 ? "text-emerald-400" : "text-zinc-200",
    },
    {
      label: "Connect Rate",
      value: `${connectRate}%`,
      subtext: "Completed vs initiated",
      color: "text-white",
    },
  ];

  const secondaryKpis = [
    {
      label: "Meetings Booked",
      value: meetings,
      subtext: "Direct demo conversions",
      color: meetings > 0 ? "text-emerald-400" : "text-zinc-300",
    },
    {
      label: "Callback Requests",
      value: callbacks,
      subtext: "Scheduled CRM follow-ups",
      color: callbacks > 0 ? "text-indigo-300" : "text-zinc-300",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      subtext: "Calls converted to meetings",
      color: "text-zinc-200",
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
    <div className="space-y-3">
      {/* Primary Operating Telemetry */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-medium block mb-2 px-1">
          Primary Operating Metrics
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {primaryKpis.map((kpi, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all duration-150 relative overflow-hidden shadow-xs ${
                kpi.highlight
                  ? "bg-[#140e09] border-amber-500/30 hover:border-amber-500/50"
                  : "bg-[#0c0c12] border-white/[0.08] hover:border-white/[0.14]"
              }`}
            >
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider truncate mb-1">
                {kpi.label}
              </div>
              <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${kpi.color}`}>
                {isLoading ? "—" : kpi.value}
              </div>
              <div className="text-[11px] text-zinc-500 truncate mt-0.5">{kpi.subtext}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Outcomes */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-medium block mb-2 px-1">
          Outcomes &amp; Conversion Telemetry
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {secondaryKpis.map((kpi, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#09090e] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-150 relative overflow-hidden"
            >
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate mb-1">
                {kpi.label}
              </div>
              <div className={`text-xl font-semibold font-mono tabular-nums tracking-tight ${kpi.color}`}>
                {isLoading ? "—" : kpi.value}
              </div>
              <div className="text-[10px] text-zinc-500/80 truncate mt-0.5">{kpi.subtext}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
