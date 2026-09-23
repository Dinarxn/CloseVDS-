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
    <div className="relative rounded-xl p-5 bg-[#09090f]/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4 backdrop-blur-sm">
      {/* Top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Pipeline Distribution
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">Lead Pipeline</h3>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Real-time progression of prospects moving through research, qualification, AI calling, and conversion.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <span className="text-xs font-mono font-medium text-zinc-300 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] tabular-nums">
            {isLoading ? "..." : `${totalLeads} Total Prospects`}
          </span>
          <Link
            href="/leads"
            className="group/link text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Open Pool</span>
            <span className="text-zinc-500 group-hover/link:text-white group-hover/link:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Always Visible 8-Stage Canonical Pipeline Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {PIPELINE_STAGES.map((stage, idx) => {
          const count = stageCounts[stage.id as keyof PipelineStageCounts] ?? 0;
          const percentage =
            totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
          const href = stageLinks[stage.id] || "/leads";
          const hasCount = count > 0;

          return (
            <Link
              key={stage.id}
              href={href}
              className={`group relative p-3.5 bg-[#0c0c14]/80 hover:bg-[#11111c] border rounded-xl flex flex-col justify-between space-y-2.5 transition-all duration-150 cursor-pointer block hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${
                hasCount
                  ? "border-white/[0.12] bg-gradient-to-b from-white/[0.03] to-transparent"
                  : "border-white/[0.06] hover:border-white/[0.16]"
              }`}
            >
              {/* Top hairline highlight on hover */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
                <span className="font-semibold text-zinc-400">0{idx + 1}</span>
                <span className="font-mono text-zinc-400 group-hover:text-zinc-200 tabular-nums">
                  {percentage}%
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums group-hover:text-white transition-colors">
                  {isLoading ? "—" : count}
                </p>
                <p className="text-xs font-semibold text-zinc-200 truncate tracking-tight mt-1 group-hover:text-white transition-colors">
                  {stage.label}
                </p>
              </div>

              <p className="text-[10px] font-mono text-zinc-400 leading-tight truncate group-hover:text-zinc-300 transition-colors">
                {stage.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Standby strip if pipeline is empty */}
      {totalLeads === 0 && !isLoading && (
        <div className="px-4 py-3 rounded-xl bg-[#0c0c14]/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="text-zinc-300 font-medium">Pipeline Standby:</span>
            <span>Awaiting prospect discovery via closeBDS or manual lead import.</span>
          </div>
          <Link
            href="/leads"
            className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Import First Prospects</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
