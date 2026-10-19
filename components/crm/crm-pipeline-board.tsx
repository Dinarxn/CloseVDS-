"use client";

import React, { useState } from "react";
import { CRM_STAGES } from "./crm-constants";
import { CrmStageColumn } from "./crm-stage-column";
import { CrmDealItem, CrmStageId } from "@/types/crm";

export interface CrmPipelineBoardProps {
  deals?: CrmDealItem[];
  onSelectDeal?: (deal: CrmDealItem) => void;
  onQuickStageChange?: (deal: CrmDealItem, nextStatus: string) => Promise<void>;
}

export function CrmPipelineBoard({
  deals = [],
  onSelectDeal,
  onQuickStageChange,
}: CrmPipelineBoardProps) {
  const [search, setSearch] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState<"ALL" | CrmStageId>("ALL");

  const filteredDeals = deals.filter((d) => {
    const matchesSearch =
      !search ||
      d.companyName.toLowerCase().includes(search.toLowerCase()) ||
      (d.contactName && d.contactName.toLowerCase().includes(search.toLowerCase())) ||
      (d.contactEmail && d.contactEmail.toLowerCase().includes(search.toLowerCase())) ||
      (d.rawStatus && String(d.rawStatus).toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedStageFilter !== "ALL" && d.stage !== selectedStageFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0c12]/90 border border-white/[0.08] p-3 rounded-xl shadow-xs">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search prospects by name, contact, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8.5 pl-8 pr-3 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors shadow-xs"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-500">
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedStageFilter("ALL")}
            className={`text-[10px] font-mono uppercase px-2 py-1 rounded transition-colors ${
              selectedStageFilter === "ALL"
                ? "bg-white text-black font-semibold shadow-xs"
                : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]"
            }`}
          >
            All Columns ({deals.length})
          </button>
          <span className="text-zinc-600 font-mono text-[10px]">•</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
            {CRM_STAGES.length} Stages
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Kanban Canvas */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex items-start space-x-3.5 min-w-[1400px]">
          {CRM_STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            return (
              <CrmStageColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
                onSelectDeal={onSelectDeal}
                onQuickStageChange={onQuickStageChange}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
