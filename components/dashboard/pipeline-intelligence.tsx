"use client";

import React from "react";
import Link from "next/link";
import { PIPELINE_STAGES } from "./dashboard-constants";

export interface PipelineStageCounts {
  DISCOVERED: number;
  RESEARCHED: number;
  QUALIFIED: number;
  CALL_READY: number;
  CONTACTED: number;
  INTERESTED: number;
  MEETING: number;
  WON: number;
}

export interface PipelineIntelligenceProps {
  stageCounts: PipelineStageCounts;
  totalLeads: number;
  isLoading: boolean;
}

const STAGE_COLORS: Record<string, { bar: string; text: string; border: string }> = {
  DISCOVERED: { bar: "bg-zinc-600", text: "text-zinc-400", border: "border-zinc-700/50" },
  RESEARCHED: { bar: "bg-zinc-400", text: "text-zinc-300", border: "border-zinc-500/50" },
  QUALIFIED: { bar: "bg-[#7D39EB]", text: "text-[#B788FF]", border: "border-[#7D39EB]/40" },
  CALL_READY: { bar: "bg-[#9A5DF7]", text: "text-[#D2B5FF]", border: "border-[#9A5DF7]/40" },
  CONTACTED: { bar: "bg-cyan-500", text: "text-cyan-300", border: "border-cyan-500/40" },
  INTERESTED: { bar: "bg-amber-400", text: "text-amber-300", border: "border-amber-400/40" },
  MEETING: { bar: "bg-[#C6FF33]", text: "text-[#C6FF33]", border: "border-[#C6FF33]/40" },
  WON: { bar: "bg-[#C6FF33]", text: "text-[#C6FF33]", border: "border-[#C6FF33]/50" },
};

export function PipelineIntelligence({
  stageCounts,
  totalLeads,
  isLoading,
}: PipelineIntelligenceProps) {
  // Map stages to direct operational destinations
  const stageLinks: Record<string, string> = {
    DISCOVERED: "/leads",
    RESEARCHED: "/operations",
    QUALIFIED: "/leads",
    CALL_READY: "/calling/calls",
    CONTACTED: "/calling/calls",
    INTERESTED: "/crm",
    MEETING: "/crm",
    WON: "/crm",
  };

  return (
    <div className="relative rounded-xl p-5 bg-surface-panel border border-white/[0.08] shadow-xs space-y-4 overflow-hidden">
      {/* Specular Top Hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-semibold">
              Pipeline Distribution
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">Acquisition Pipeline</h3>
          <p className="text-xs text-[#8E8E9F] mt-0.5 leading-relaxed">
            Real-time progression of prospects moving through research, qualification, AI calling, and conversion.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <span className="text-xs font-mono font-medium text-[#CBCBD6] px-3 py-1 rounded-lg bg-surface-card border border-white/[0.08] tabular-nums">
            {isLoading ? "..." : `${totalLeads} Total Prospects`}
          </span>
          <Link
            href="/leads"
            className="group/link text-xs font-mono text-[#8E8E9F] hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Open Pool</span>
            <span className="text-[#565668] group-hover/link:text-white group-hover/link:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Horizontal Multi-Stage Progress Flow Strip */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-surface-card border border-white/[0.06] overflow-hidden flex">
          {PIPELINE_STAGES.map((stage) => {
            const count = stageCounts[stage.id as keyof PipelineStageCounts] ?? 0;
            const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            if (pct <= 0) return null;
            const colors = STAGE_COLORS[stage.id] || { bar: "bg-[#7D39EB]" };
            return (
              <div
                key={stage.id}
                style={{ width: `${Math.max(pct, 2)}%` }}
                className={`h-full ${colors.bar} transition-all duration-300`}
                title={`${stage.label}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* 8-Stage Canonical Pipeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = stageCounts[stage.id as keyof PipelineStageCounts] ?? 0;
          const percentage =
            totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
          const href = stageLinks[stage.id] || "/leads";
          const hasCount = count > 0;
          const colors = STAGE_COLORS[stage.id] || { bar: "bg-[#7D39EB]", text: "text-white", border: "border-white/[0.12]" };

          return (
            <Link
              key={stage.id}
              href={href}
              className={`group relative p-3 bg-surface-card hover:bg-surface-card-hover border rounded-xl flex flex-col justify-between space-y-2 transition-all duration-150 cursor-pointer block hover:-translate-y-0.5 shadow-xs ${
                hasCount
                  ? `${colors.border} bg-gradient-to-b from-white/[0.04] to-surface-card`
                  : "border-white/[0.06] hover:border-white/[0.16]"
              }`}
            >
              {/* Specular hairline on hover */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E9F] group-hover:text-[#CBCBD6] transition-colors">
                <span className="font-semibold text-[#8E8E9F]">0{idx + 1}</span>
                <span className="font-mono text-[#8E8E9F] group-hover:text-white tabular-nums">
                  {percentage}%
                </span>
              </div>

              <div>
                <p className={`text-2xl font-bold font-mono tracking-tight tabular-nums transition-colors ${
                  stage.id === "MEETING" || stage.id === "WON"
                    ? hasCount ? "text-[#C6FF33]" : "text-white"
                    : "text-white"
                }`}>
                  {isLoading ? "—" : count}
                </p>
                <p className="text-xs font-semibold text-[#CBCBD6] truncate tracking-tight mt-0.5 group-hover:text-white transition-colors">
                  {stage.label}
                </p>
              </div>

              <p className="text-[10px] font-mono text-[#8E8E9F] leading-tight truncate group-hover:text-[#CBCBD6] transition-colors">
                {stage.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Standby strip if pipeline is empty */}
      {totalLeads === 0 && !isLoading && (
        <div className="px-4 py-3 rounded-xl bg-surface-card border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#8E8E9F]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#565668]" />
            <span className="text-[#CBCBD6] font-medium">Pipeline Standby:</span>
            <span>Awaiting prospect discovery via closeBDS or manual lead import.</span>
          </div>
          <Link
            href="/leads"
            className="text-xs font-mono text-[#7D39EB] hover:text-[#B788FF] flex items-center gap-1 shrink-0 transition-colors font-medium"
          >
            <span>Import First Prospects</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
