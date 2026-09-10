"use client";

import React from "react";
import { Card } from "@/components/ui/card";
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

  const kpis = [
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
      color: "text-sky-400",
    },
    {
      label: "Awaiting Review",
      value: approvalRequiredCount,
      subtext: "Human approval needed",
      color: approvalRequiredCount > 0 ? "text-amber-400 font-bold" : "text-white",
      highlight: approvalRequiredCount > 0,
    },
    {
      label: "Calls Completed",
      value: completedCalls,
      subtext: `Total lifetime: ${totalCalls}`,
      color: "text-emerald-400",
    },
    {
      label: "Connect Rate",
      value: `${connectRate}%`,
      subtext: "Completed vs initiated",
      color: "text-white",
    },
    {
      label: "Meetings Booked",
      value: meetings,
      subtext: "Direct demo conversions",
      color: "text-emerald-300",
    },
    {
      label: "Callback Requests",
      value: callbacks,
      subtext: "Scheduled CRM follow-ups",
      color: "text-indigo-300",
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      subtext: "Calls converted to meetings",
      color: "text-white",
    },
    {
      label: "Opt-Out Rate",
      value: `${optOutRate}%`,
      subtext: `${optOuts} prospect opt-outs`,
      color: optOuts > 0 ? "text-rose-400" : "text-zinc-500",
    },
    {
      label: "Avg Call Duration",
      value: formatCallDuration(avgDuration),
      subtext: "Conversation runtime",
      color: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi, idx) => (
        <Card
          key={idx}
          variant="standard"
          className={`p-3.5 space-y-1.5 transition-all duration-150 ${
            kpi.highlight ? "border-amber-700/80 bg-amber-950/20" : ""
          }`}
        >
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider truncate">
            {kpi.label}
          </div>
          <div className={`text-xl font-bold font-mono tabular-nums tracking-tight ${kpi.color}`}>
            {isLoading ? "—" : kpi.value}
          </div>
          <div className="text-[10px] text-zinc-500 truncate">{kpi.subtext}</div>
        </Card>
      ))}
    </div>
  );
}
