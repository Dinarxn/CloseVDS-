import React from "react";
import { CrmDealItem, CrmStageConfig } from "@/types/crm";

export interface CrmStageColumnProps {
  stage: CrmStageConfig;
  deals: CrmDealItem[];
  onSelectDeal?: (deal: CrmDealItem) => void;
}

export function CrmStageColumn({ stage, deals, onSelectDeal }: CrmStageColumnProps) {
  return (
    <div className="flex-1 min-w-[270px] max-w-[320px] bg-[#0c0c12]/90 border border-white/[0.08] rounded-xl flex flex-col max-h-[750px] shadow-xs relative overflow-hidden">
      {/* Top hairline highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Column Header */}
      <div className="p-3.5 border-b border-white/[0.06] bg-[#09090f]/95 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
            {stage.label}
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
              deals.length > 0
                ? "bg-white/[0.08] text-white border-white/[0.14]"
                : "bg-white/[0.02] text-zinc-500 border-white/[0.06]"
            }`}
          >
            {deals.length}
          </span>
        </div>
        <p className="text-[10px] text-zinc-400 line-clamp-1 leading-snug">
          {stage.description}
        </p>
      </div>

      {/* Deals Container / Empty Indicator */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
        {deals.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/[0.06] rounded-lg bg-white/[0.01] space-y-0.5">
            <span className="text-[11px] font-mono text-zinc-400 block font-medium">No prospects</span>
            <span className="text-[10px] text-zinc-500 block">Stage queue is empty</span>
          </div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onSelectDeal?.(deal)}
              className="p-3 bg-[#09090f]/80 border border-white/[0.07] hover:border-white/[0.16] rounded-lg hover:bg-white/[0.02] transition-all cursor-pointer space-y-2 text-xs shadow-xs"
            >
              <div className="font-semibold text-white tracking-tight">{deal.companyName}</div>
              {deal.contactName && (
                <div className="text-[11px] text-zinc-400 font-normal">{deal.contactName}</div>
              )}
              {deal.qualificationScore !== undefined && (
                <div className="pt-0.5">
                  <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                    Score {deal.qualificationScore}/100
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
