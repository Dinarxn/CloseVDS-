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
    <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Acquisition Lifecycle Conversion Funnel
          </h3>
          <p className="text-xs text-[#737373]">
            Progression from lead discovery through human approval gates to closed clients
          </p>
        </div>
        <span className="text-[11px] font-mono text-[#737373] uppercase">
          Full Lifecycle: 7 Stages
        </span>
      </div>

      <div className="space-y-2 pt-2">
        {stages.map((stage) => (
          <div
            key={stage.stageId}
            className="p-3 bg-[#0a0a0a] border border-[#404040] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          >
            <div className="space-y-0.5 max-w-sm">
              <div className="font-semibold text-white">{stage.stageLabel}</div>
              <div className="text-[11px] text-[#737373]">{stage.description}</div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Volume</span>
                <span className="font-mono font-bold text-white text-sm">{stage.count}</span>
              </div>
              <div className="text-right min-w-[70px]">
                <span className="text-[10px] text-[#737373] uppercase tracking-wider block">Conversion</span>
                <span className="font-mono text-white text-xs">
                  {stage.count > 0 ? `${stage.conversionRateFromPrevious}%` : "—"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
