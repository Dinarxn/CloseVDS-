import React from "react";
import { ACQUISITION_FUNNEL_STAGES } from "./analytics-constants";
import { FunnelStageMetric } from "@/types/analytics";

export interface AcquisitionFunnelViewProps {
  stages?: FunnelStageMetric[];
}

export function AcquisitionFunnelView({
  stages = ACQUISITION_FUNNEL_STAGES,
}: AcquisitionFunnelViewProps) {
  return (
    <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-5 space-y-4 shadow-xs overflow-hidden">
      {/* Top hairline highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Acquisition Lifecycle Conversion Funnel
          </h3>
          <p className="text-xs text-zinc-400">
            Progression from lead discovery through human approval gates to closed clients
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08] font-medium">
            Full Lifecycle: 7 Stages
          </span>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="p-8 text-center border border-white/[0.04] rounded-lg bg-[#09090f]/50">
          <p className="text-xs font-mono text-zinc-400">
            No acquisition funnel progression recorded for the selected timeframe.
          </p>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {stages.map((stage, index) => (
            <div
              key={stage.stageId}
              className="p-3.5 bg-[#09090f]/80 border border-white/[0.06] hover:border-white/[0.14] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex items-start sm:items-center gap-3 max-w-md">
                <span className="text-[10px] font-mono text-zinc-400 font-semibold px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] shrink-0">
                  0{index + 1}
                </span>
                <div className="space-y-0.5">
                  <div className="font-semibold text-zinc-100 tracking-tight">{stage.stageLabel}</div>
                  <div className="text-[11px] text-zinc-400">{stage.description}</div>
                </div>
              </div>

              <div className="flex items-center space-x-6 shrink-0 self-end sm:self-auto">
                <div className="text-right min-w-[60px]">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">Volume</span>
                  <span className="font-mono font-bold text-white text-sm tabular-nums">{stage.count}</span>
                </div>
                <div className="text-right min-w-[70px]">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">Conversion</span>
                  <span className={`font-mono text-xs tabular-nums ${stage.count > 0 ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                    {stage.count > 0 ? `${stage.conversionRateFromPrevious}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
