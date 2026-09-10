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
    <div className="rounded-xl p-5 bg-[#0c0c12] border border-white/[0.07] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Pipeline Distribution
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">Lead Pipeline</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time progression of prospects moving through research, qualification, AI calling, and conversion.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06]">
            {isLoading ? "..." : `${totalLeads} Total Prospects`}
          </span>
          <Link
            href="/leads"
            className="text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Open Pool</span>
            <span className="text-zinc-500">→</span>
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

          return (
            <Link
              key={stage.id}
              href={href}
              className="group p-3 bg-[#0e0e16] hover:bg-[#12121e] border border-white/[0.06] hover:border-white/[0.18] rounded-lg flex flex-col justify-between space-y-2 transition-all duration-150 cursor-pointer block hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
                <span>0{idx + 1}</span>
                <span className="font-semibold text-zinc-400 group-hover:text-zinc-200">
                  {percentage}%
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold font-mono text-white tracking-tight group-hover:text-white transition-colors">
                  {isLoading ? "—" : count}
                </p>
                <p className="text-xs font-semibold text-zinc-200 truncate tracking-tight mt-1 group-hover:text-white transition-colors">
                  {stage.label}
                </p>
              </div>

              <p className="text-[10px] text-zinc-500 leading-tight truncate group-hover:text-zinc-400 transition-colors">
                {stage.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Standby strip if pipeline is empty */}
      {totalLeads === 0 && !isLoading && (
        <div className="px-3.5 py-2.5 rounded-lg bg-[#0e0e16]/60 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            <span className="text-zinc-300 font-medium">Pipeline Standby:</span>
            <span>Awaiting prospect discovery via closeBDS or manual lead import.</span>
          </div>
          <Link
            href="/leads"
            className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1 shrink-0 underline underline-offset-4 decoration-zinc-600 hover:decoration-white transition-colors"
          >
            <span>Import First Prospects</span>
            <span>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
