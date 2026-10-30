"use client";

import React, { useState, useMemo } from "react";
import { CrmDealItem, CrmStageConfig, CanonicalLeadStatus } from "@/types/crm";
import { getAllowedNextStages } from "@/lib/mappers";
import { CrmEmptyState } from "./crm-empty-state";

export interface CrmStageColumnProps {
  stage: CrmStageConfig;
  deals: CrmDealItem[];
  onSelectDeal?: (deal: CrmDealItem) => void;
  onQuickStageChange?: (deal: CrmDealItem, nextStatus: string) => Promise<void>;
}

// Canonical ordering rank to reliably calculate "Forward" vs "Backward" targets
const STATUS_PROGRESSION_RANK: Record<string, number> = {
  DISCOVERED: 1,
  IMPORTED: 2,
  NEW: 2,
  RESEARCH_PENDING: 3,
  RESEARCHED: 4,
  QUALIFICATION_PENDING: 5,
  QUALIFIED: 6,
  CALL_READY: 7,
  CONTACTED: 8,
  IN_FOLLOWUP: 9,
  REPLIED: 9,
  INTERESTED: 10,
  MEETING: 11,
  MEETING_BOOKED: 11,
  WON: 12,
  CLOSED_WON: 12,
  LOST: 99,
  CLOSED_LOST: 99,
  DISQUALIFIED: 99,
  OPT_OUT: 100,
};

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

  const handleStepTransition = async (
    e: React.MouseEvent,
    deal: CrmDealItem,
    targetStatus: string
  ) => {
    e.stopPropagation();
    if (!targetStatus || !onQuickStageChange) return;

    setMovingDealId(deal.id);
    try {
      await onQuickStageChange(deal, targetStatus);
    } finally {
      setMovingDealId(null);
    }
  };

  // Calculate stage total valuation
  const stageTotalValue = useMemo(() => {
    return deals.reduce((sum, d) => sum + (d.valueEstimate || 0), 0);
  }, [deals]);

  // Format currency
  const formatCurrency = (val: number) => {
    if (val === 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return `$${val.toLocaleString()}`;
  };

  // Visual status marker for stage header
  const getStageMarkerClass = (stageId: string) => {
    switch (stageId) {
      case "discovered":
        return "bg-white/20 border-white/50 text-[#CBCBD6]";
      case "qualified":
        return "bg-[#7D39EB]/20 border-[#7D39EB]/60 text-[#7D39EB]";
      case "outreach_approved":
        return "bg-sky-500/20 border-sky-400/60 text-sky-300";
      case "contacted":
        return "bg-indigo-500/20 border-indigo-400/60 text-indigo-300";
      case "in_followup":
        return "bg-amber-500/20 border-amber-400/60 text-amber-300";
      case "meeting_booked":
        return "bg-[#7D39EB]/30 border-[#7D39EB] text-white";
      case "closed_won":
        return "bg-[#C6FF33]/25 border-[#C6FF33]/80 text-[#C6FF33]";
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
    <div className="flex-1 min-w-[285px] max-w-[340px] bg-surface-panel border border-white/[0.08] hover:border-white/[0.14] rounded-xl flex flex-col max-h-[840px] shadow-xs relative overflow-hidden transition-colors">
      {/* Precision top specular hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Stage Header */}
      <div className="p-3.5 border-b border-white/[0.06] bg-surface-card/60 space-y-2">
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
                  ? stage.id === "closed_won"
                    ? "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                    : "bg-white/[0.08] text-white border-white/[0.14]"
                  : "bg-white/[0.02] text-[#8E8E9F] border-white/[0.06]"
              }`}
            >
              {deals.length}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
          <span className="text-[#8E8E9F] truncate max-w-[170px]" title={stage.description}>
            {stage.description}
          </span>
          <span
            className={`tabular-nums font-semibold shrink-0 ${
              stage.id === "closed_won" ? "text-[#C6FF33]" : "text-[#CBCBD6]"
            }`}
          >
            {formatCurrency(stageTotalValue)}
          </span>
        </div>
      </div>

      {/* Deals Container */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2.5 scrollbar-thin">
        {deals.length === 0 ? (
          <CrmEmptyState
            compact
            title="No active deals"
            description="Queue is currently clear"
          />
        ) : (
          deals.map((deal) => {
            const allowedNext = getAllowedNextStages(deal.rawStatus);
            const isMoving = movingDealId === deal.id;
            const touchDate = formatCardDate(deal.lastTouchDate);
            const nextFollowUp = formatCardDate(deal.nextFollowUpDate);

            // Calculate Forward and Backward targets
            const currentRank = STATUS_PROGRESSION_RANK[String(deal.rawStatus).toUpperCase()] || 0;
            const forwardCandidates = allowedNext.filter(
              (st) => (STATUS_PROGRESSION_RANK[st] || 0) > currentRank && (STATUS_PROGRESSION_RANK[st] || 0) < 90
            );
            const backwardCandidates = allowedNext.filter(
              (st) => (STATUS_PROGRESSION_RANK[st] || 0) < currentRank && (STATUS_PROGRESSION_RANK[st] || 0) > 0
            );

            // Default forward target (lowest forward candidate or first allowed)
            const forwardTarget = forwardCandidates[0] || (allowedNext.includes("WON" as CanonicalLeadStatus) ? "WON" : allowedNext[0]);
            // Default backward target (highest backward candidate)
            const backwardTarget = backwardCandidates[backwardCandidates.length - 1];

            const isHighQualification = (deal.qualificationScore ?? 0) >= 70;
            const isClosedWon = deal.stage === "closed_won";

            return (
              <div
                key={deal.id}
                onClick={() => onSelectDeal?.(deal)}
                className={`bg-surface-card border rounded-xl p-3.5 shadow-xs relative overflow-hidden transition-all duration-150 cursor-pointer space-y-2.5 text-xs group ${
                  isMoving
                    ? "opacity-50 border-white/30 pointer-events-none"
                    : "border-white/[0.08] hover:border-white/[0.18] hover:bg-surface-card-hover"
                }`}
              >
                {/* Top specular reflection */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none group-hover:via-white/20 transition-all" />

                {/* Header: Company & Current Stage / Raw Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-white tracking-tight truncate flex-1 text-[13px] group-hover:text-white">
                    {deal.companyName}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-[#CBCBD6] border border-white/[0.08] uppercase shrink-0 font-medium">
                    {deal.rawStatus}
                  </span>
                </div>

                {/* Deal Value & Qualification Metrics */}
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded tabular-nums border ${
                      isClosedWon
                        ? "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                        : "bg-surface-elevated text-white border-white/[0.10]"
                    }`}
                  >
                    {deal.valueEstimate ? `$${deal.valueEstimate.toLocaleString()}` : "$3,500"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {deal.qualificationScore !== undefined && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold tabular-nums border ${
                          isHighQualification
                            ? "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                            : "bg-white/[0.04] text-[#8E8E9F] border-white/[0.08]"
                        }`}
                        title={`Qualification Score: ${deal.qualificationScore}`}
                      >
                        Score {deal.qualificationScore}
                      </span>
                    )}
                    {deal.leadSource && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.02] text-[#8E8E9F] border border-white/[0.05]">
                        {deal.leadSource}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                {(deal.contactName || deal.contactEmail || deal.contactPhone) && (
                  <div className="space-y-1 text-[11px] text-[#CBCBD6] pt-0.5 border-t border-white/[0.04]">
                    {deal.contactName && (
                      <div className="font-medium text-white truncate flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-[#8E8E9F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{deal.contactName}</span>
                      </div>
                    )}
                    {(deal.contactEmail || deal.contactPhone) && (
                      <div className="text-[10px] text-[#8E8E9F] font-mono truncate flex items-center gap-1.5">
                        {deal.contactEmail ? (
                          <>
                            <svg className="w-3 h-3 text-[#8E8E9F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{deal.contactEmail}</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 text-[#8E8E9F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8E8E9F] pt-1">
                  {nextFollowUp ? (
                    <span className="flex items-center gap-1 text-amber-400">
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
                    <span className="flex items-center gap-1 text-[#CBCBD6]">
                      <svg className="w-3 h-3 text-[#8E8E9F] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>{deal.notesCount}</span>
                    </span>
                  )}
                </div>

                {/* Quick Stage Move Controls (Move Forward / Move Backward / Select) */}
                {allowedNext.length > 0 && onQuickStageChange && (
                  <div
                    className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1">
                      {/* Move Backward Button */}
                      <button
                        type="button"
                        onClick={(e) => backwardTarget && handleStepTransition(e, deal, backwardTarget)}
                        disabled={!backwardTarget || isMoving}
                        title={backwardTarget ? `Move backward to ${backwardTarget}` : "No backward transition"}
                        className={`h-6 px-1.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                          backwardTarget
                            ? "bg-surface-elevated text-[#CBCBD6] hover:text-white border-white/[0.10] hover:border-white/[0.22]"
                            : "bg-surface-input text-[#565668] border-white/[0.04] cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span>←</span>
                        <span className="hidden sm:inline">Back</span>
                      </button>

                      {/* Move Forward Button */}
                      <button
                        type="button"
                        onClick={(e) => forwardTarget && handleStepTransition(e, deal, forwardTarget)}
                        disabled={!forwardTarget || isMoving}
                        title={forwardTarget ? `Advance forward to ${forwardTarget}` : "No forward transition"}
                        className={`h-6 px-1.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-all cursor-pointer ${
                          forwardTarget
                            ? "bg-[#7D39EB]/15 text-[#CBCBD6] hover:text-white hover:bg-[#7D39EB]/30 border-[#7D39EB]/30 hover:border-[#7D39EB]/60"
                            : "bg-surface-input text-[#565668] border-white/[0.04] cursor-not-allowed opacity-50"
                        }`}
                      >
                        <span className="hidden sm:inline">Advance</span>
                        <span>→</span>
                      </button>
                    </div>

                    {/* Granular stage jump selector */}
                    <select
                      value=""
                      onChange={(e) => handleStageSelect(e, deal)}
                      disabled={isMoving}
                      title="Select stage to move to"
                      className="h-6 px-1.5 bg-surface-elevated text-[#CBCBD6] hover:text-white text-[9px] font-mono rounded border border-white/[0.08] focus:outline-none focus:border-[#7D39EB] transition-colors cursor-pointer max-w-[105px]"
                    >
                      <option value="" disabled>
                        Jump to...
                      </option>
                      {allowedNext.map((st) => (
                        <option key={st} value={st} className="bg-surface-panel text-white">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {deal.rawStatus === "OPT_OUT" && (
                  <div className="pt-1.5 border-t border-rose-500/20 text-[9px] font-mono text-rose-400 flex items-center gap-1">
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
