import React from "react";
import { ACQUISITION_FUNNEL_STAGES } from "./analytics-constants";
import { FunnelStageMetric } from "@/types/analytics";

export interface AcquisitionFunnelViewProps {
  stages?: FunnelStageMetric[];
}

export function AcquisitionFunnelView({
  stages = ACQUISITION_FUNNEL_STAGES,
}: AcquisitionFunnelViewProps) {
  const maxVolume = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-5 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Top hairline highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.07]">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Acquisition Lifecycle Conversion Funnel
          </h3>
          <p className="text-xs text-zinc-400 font-sans mt-0.5">
            Progression from candidate lead discovery through human approval gates to closed clients
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08] font-medium">
            Full Lifecycle · 7 Canonical Stages
          </span>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-white/[0.08] rounded-xl bg-surface-panel">
          <p className="text-xs font-mono text-zinc-400">
            No acquisition funnel progression recorded for the selected timeframe.
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {stages.map((stage, index) => {
            const widthPct = Math.max(3, Math.round((stage.count / maxVolume) * 100));

            return (
              <div
                key={stage.stageId}
                className="p-3.5 bg-surface-panel border border-white/[0.07] hover:border-white/[0.15] rounded-xl flex flex-col gap-2.5 text-xs transition-all duration-150 hover:bg-surface-panel/80 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 max-w-lg">
                    <span className="text-[10px] font-mono text-zinc-300 font-semibold px-2 py-0.5 rounded bg-surface-elevated border border-white/[0.10] shrink-0">
                      0{index + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-zinc-100 tracking-tight font-sans text-xs">
                        {stage.stageLabel}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans">{stage.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 shrink-0 self-end sm:self-auto">
                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">Volume</span>
                      <span className="font-mono font-bold text-white text-sm tabular-nums">
                        {stage.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right min-w-[75px]">
                      <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">Conversion</span>
                      <span className={`font-mono text-xs tabular-nums ${stage.count > 0 ? "text-emerald-400 font-semibold" : "text-zinc-500"}`}>
                        {stage.count > 0 ? `${stage.conversionRateFromPrevious}%` : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Proportional Funnel Bar */}
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-zinc-400 to-zinc-100 rounded-full transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
