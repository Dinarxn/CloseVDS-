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

  // Calculate stage total value
  const stageTotalValue = deals.reduce((sum, d) => sum + (d.valueEstimate || 0), 0);

  // Format currency
  const formatCurrency = (val: number) => {
    if (val === 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return `$${val.toLocaleString()}`;
  };

  // Get visual status marker for stage
  const getStageMarkerClass = (stageId: string) => {
    switch (stageId) {
      case "discovered":
        return "bg-zinc-400/20 border-zinc-400/50 text-zinc-300";
      case "qualified":
        return "bg-emerald-500/20 border-emerald-400/60 text-emerald-300";
      case "outreach_approved":
        return "bg-sky-500/20 border-sky-400/60 text-sky-300";
      case "contacted":
        return "bg-indigo-500/20 border-indigo-400/60 text-indigo-300";
      case "in_followup":
        return "bg-amber-500/20 border-amber-400/60 text-amber-300";
      case "meeting_booked":
        return "bg-purple-500/20 border-purple-400/60 text-purple-300";
      case "closed_won":
        return "bg-emerald-400/30 border-emerald-300 text-emerald-200";
      case "closed_lost":
        return "bg-rose-500/20 border-rose-400/60 text-rose-300";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  };

  // Format short date for cards
  const formatCardDate = (raw?: string) => {
    if (!raw) return null;
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return null;
    }
  };

  return (
    <div className="flex-1 min-w-[285px] max-w-[340px] bg-[#0d0d12] border border-white/[0.08] rounded-xl flex flex-col max-h-[820px] shadow-xs relative overflow-hidden">
      {/* Precision top hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Stage Header */}
      <div className="p-3.5 border-b border-white/[0.06] bg-[#09090e] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full border shrink-0 ${getStageMarkerClass(stage.id)}`}
              title={stage.label}
            />
            <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono truncate">
              {stage.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
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
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
          <span className="text-zinc-500 truncate max-w-[170px]" title={stage.description}>
            {stage.description}
          </span>
          <span className="text-zinc-400 tabular-nums font-semibold shrink-0">
            {formatCurrency(stageTotalValue)}
          </span>
        </div>
      </div>

      {/* Deals Container */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
        {deals.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-white/[0.06] rounded-lg bg-white/[0.01] space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 block font-medium">No active deals</span>
            <span className="text-[10px] text-zinc-500 block">Queue is currently clear</span>
          </div>
        ) : (
          deals.map((deal) => {
            const allowedNext = getAllowedNextStages(deal.rawStatus);
            const isMoving = movingDealId === deal.id;
            const touchDate = formatCardDate(deal.lastTouchDate);
            const nextFollowUp = formatCardDate(deal.nextFollowUpDate);

            return (
              <div
                key={deal.id}
                onClick={() => onSelectDeal?.(deal)}
                className={`p-3.5 bg-[#121218] border rounded-xl transition-all duration-150 cursor-pointer space-y-2.5 text-xs shadow-xs relative group ${
                  isMoving
                    ? "opacity-50 border-white/30 pointer-events-none"
                    : "border-white/[0.07] hover:border-white/[0.18] hover:bg-[#171720]"
                }`}
              >
                {/* Subtle card top hairline */}
                <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none group-hover:via-white/[0.16] transition-all" />

                {/* Header: Company & Raw status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-white tracking-tight truncate flex-1 text-[13px] group-hover:text-zinc-100">
                    {deal.companyName}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08] uppercase shrink-0 font-medium">
                    {deal.rawStatus}
                  </span>
                </div>

                {/* Deal Value & Qualification Metrics */}
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
                    {deal.valueEstimate ? `$${deal.valueEstimate.toLocaleString()}` : "$3,500"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {deal.qualificationScore !== undefined && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.03] text-zinc-300 border border-white/[0.07] font-medium">
                        Score {deal.qualificationScore}
                      </span>
                    )}
                    {deal.leadSource && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.02] text-zinc-500 border border-white/[0.05]">
                        {deal.leadSource}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact information */}
                {(deal.contactName || deal.contactEmail || deal.contactPhone) && (
                  <div className="space-y-1 text-[11px] text-zinc-400 pt-0.5 border-t border-white/[0.04]">
                    {deal.contactName && (
                      <div className="font-medium text-zinc-200 truncate flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{deal.contactName}</span>
                      </div>
                    )}
                    {(deal.contactEmail || deal.contactPhone) && (
                      <div className="text-[10px] text-zinc-400 font-mono truncate flex items-center gap-1.5">
                        {deal.contactEmail ? (
                          <>
                            <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{deal.contactEmail}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="truncate">{deal.contactPhone}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Activity & Follow-Up Date Markers */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                  {nextFollowUp ? (
                    <span className="flex items-center gap-1 text-amber-400/90">
                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Due {nextFollowUp}</span>
                    </span>
                  ) : touchDate ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Touch {touchDate}</span>
                    </span>
                  ) : (
                    <span>No recent touch</span>
                  )}

                  {deal.notesCount !== undefined && deal.notesCount > 0 && (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>{deal.notesCount}</span>
                    </span>
                  )}
                </div>

                {/* Quick Stage Transition Dropdown */}
                {allowedNext.length > 0 && onQuickStageChange && (
                  <div
                    className="pt-2 border-t border-white/[0.04] flex items-center justify-between gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                      Move:
                    </span>
                    <select
                      value=""
                      onChange={(e) => handleStageSelect(e, deal)}
                      disabled={isMoving}
                      className="h-6.5 px-2 bg-[#09090e] text-zinc-300 hover:text-white text-[10px] font-mono rounded-md border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
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
                  <div className="pt-1.5 border-t border-rose-500/20 text-[9px] font-mono text-rose-400/90 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Regulatory Opt-Out Active</span>
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
