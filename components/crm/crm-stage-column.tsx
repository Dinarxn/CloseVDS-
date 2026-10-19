"use client";

import React, { useState } from "react";
import { CrmDealItem, CrmStageConfig } from "@/types/crm";
import { getAllowedNextStages } from "@/lib/mappers";

export interface CrmStageColumnProps {
  stage: CrmStageConfig;
  deals: CrmDealItem[];
  onSelectDeal?: (deal: CrmDealItem) => void;
  onQuickStageChange?: (deal: CrmDealItem, nextStatus: string) => Promise<void>;
}

export function CrmStageColumn({
  stage,
  deals,
  onSelectDeal,
  onQuickStageChange,
}: CrmStageColumnProps) {
  const [movingDealId, setMovingDealId] = useState<string | null>(null);

  const handleStageSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    deal: CrmDealItem
  ) => {
    e.stopPropagation();
    const nextStatus = e.target.value;
    if (!nextStatus || !onQuickStageChange) return;

    setMovingDealId(deal.id);
    try {
      await onQuickStageChange(deal, nextStatus);
    } finally {
      setMovingDealId(null);
    }
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[340px] bg-[#0c0c12]/90 border border-white/[0.08] rounded-xl flex flex-col max-h-[780px] shadow-xs relative overflow-hidden">
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
          deals.map((deal) => {
            const allowedNext = getAllowedNextStages(deal.rawStatus);
            const isMoving = movingDealId === deal.id;

            return (
              <div
                key={deal.id}
                onClick={() => onSelectDeal?.(deal)}
                className={`p-3 bg-[#09090f]/85 border rounded-lg transition-all cursor-pointer space-y-2 text-xs shadow-xs relative ${
                  isMoving
                    ? "opacity-50 border-white/30 pointer-events-none"
                    : "border-white/[0.07] hover:border-white/[0.18] hover:bg-white/[0.02]"
                }`}
              >
                {/* Header: Company & Raw status */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="font-semibold text-white tracking-tight truncate flex-1">
                    {deal.companyName}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08] uppercase shrink-0 font-medium">
                    {deal.rawStatus}
                  </span>
                </div>

                {/* Contact information */}
                {(deal.contactName || deal.contactEmail || deal.contactPhone) && (
                  <div className="space-y-0.5 text-[11px] text-zinc-400">
                    {deal.contactName && (
                      <div className="font-medium text-zinc-300 truncate">
                        {deal.contactName}
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-500 font-mono truncate">
                      {deal.contactEmail || deal.contactPhone || "No direct phone/email"}
                    </div>
                  </div>
                )}

                {/* Badges: Score & Source */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {deal.qualificationScore !== undefined && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                      Score {deal.qualificationScore}
                    </span>
                  )}
                  {deal.leadSource && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.02] text-zinc-500 border border-white/[0.05]">
                      {deal.leadSource}
                    </span>
                  )}
                </div>

                {/* Quick Stage Transition Dropdown (Supported backend transitions only) */}
                {allowedNext.length > 0 && onQuickStageChange && (
                  <div
                    className="pt-1.5 border-t border-white/[0.04] flex items-center justify-between gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">
                      Move:
                    </span>
                    <select
                      value=""
                      onChange={(e) => handleStageSelect(e, deal)}
                      disabled={isMoving}
                      className="h-6 px-1.5 bg-[#050508] text-zinc-300 hover:text-white text-[10px] font-mono rounded border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
                    >
                      <option value="" disabled>
                        Next stage →
                      </option>
                      {allowedNext.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {deal.rawStatus === "OPT_OUT" && (
                  <div className="pt-1 text-[9px] font-mono text-rose-400/90 italic">
                    Opt-out recorded (Terminal)
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
