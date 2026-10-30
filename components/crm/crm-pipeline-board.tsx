"use client";

import React, { useState, useMemo } from "react";
import { CRM_STAGES } from "./crm-constants";
import { CrmStageColumn } from "./crm-stage-column";
import { CrmEmptyState } from "./crm-empty-state";
import { Button } from "@/components/ui/button";
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
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => {
      // Search term match across company, contact, email, phone, or raw status
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesQuery =
          d.companyName.toLowerCase().includes(query) ||
          (d.contactName && d.contactName.toLowerCase().includes(query)) ||
          (d.contactEmail && d.contactEmail.toLowerCase().includes(query)) ||
          (d.contactPhone && d.contactPhone.toLowerCase().includes(query)) ||
          (d.rawStatus && String(d.rawStatus).toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // Stage filter
      if (selectedStageFilter !== "ALL" && d.stage !== selectedStageFilter) {
        return false;
      }

      // Minimum score filter
      if (minScoreFilter > 0 && (d.qualificationScore === undefined || d.qualificationScore < minScoreFilter)) {
        return false;
      }

      return true;
    });
  }, [deals, search, selectedStageFilter, minScoreFilter]);

  // Total visible deal value
  const totalVisibleValue = useMemo(() => {
    return filteredDeals.reduce((sum, d) => sum + (d.valueEstimate || 0), 0);
  }, [filteredDeals]);

  const formatCurrency = (val: number) => {
    if (val === 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return `$${val.toLocaleString()}`;
  };

  const hasActiveFilters = search.trim() !== "" || selectedStageFilter !== "ALL" || minScoreFilter > 0;

  const resetFilters = () => {
    setSearch("");
    setSelectedStageFilter("ALL");
    setMinScoreFilter(0);
  };

  return (
    <div className="space-y-4">
      {/* Precision Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-panel border border-white/[0.08] p-3.5 rounded-xl shadow-xs relative overflow-hidden">
        {/* Specular hairline highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search prospects by company, contact, email, or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-surface-input text-white text-xs rounded-lg border border-white/[0.08] placeholder:text-[#8E8E9F] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB]/40 transition-colors shadow-xs"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8E8E9F]">
              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8E8E9F] hover:text-white text-xs cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Score Threshold Filter */}
          <select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(Number(e.target.value))}
            className="h-9 px-2.5 bg-surface-input text-[#CBCBD6] hover:text-white text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB]/40 transition-colors cursor-pointer shrink-0 font-mono"
            title="Filter by qualification score"
          >
            <option value={0} className="bg-surface-panel text-white">All Scores</option>
            <option value={70} className="bg-surface-panel text-white">Score ≥ 70</option>
            <option value={80} className="bg-surface-panel text-white">Score ≥ 80</option>
            <option value={90} className="bg-surface-panel text-white">Score ≥ 90</option>
          </select>
        </div>

        {/* Stage Columns & Metrics Pill */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Stage Column Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-input border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setSelectedStageFilter("ALL")}
              className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded transition-colors cursor-pointer ${
                selectedStageFilter === "ALL"
                  ? "bg-[#7D39EB] text-white font-semibold shadow-xs"
                  : "text-[#8E8E9F] hover:text-[#CBCBD6]"
              }`}
            >
              All Stages
            </button>
            <span className="text-zinc-600 font-mono text-[10px]">•</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded text-[#8E8E9F]">
              {CRM_STAGES.length} Stages
            </span>
          </div>

          {/* Deals & Value Telemetry Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-input border border-white/[0.06] font-mono text-xs">
            <span className="text-[#8E8E9F]">
              Deals: <strong className="text-white font-medium tabular-nums">{filteredDeals.length}</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-[#8E8E9F]">
              Value: <strong className="text-[#C6FF33] font-semibold tabular-nums">{formatCurrency(totalVisibleValue)}</strong>
            </span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="xs"
              onClick={resetFilters}
              className="text-[11px] font-mono text-[#CBCBD6] hover:text-white border-white/[0.08] hover:border-white/[0.2] transition-colors"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* When filtering leads to 0 results across all columns */}
      {deals.length > 0 && filteredDeals.length === 0 ? (
        <CrmEmptyState
          title="No matching prospects in pipeline"
          description={`Your search or filter criteria did not match any active deals out of ${deals.length} total prospects.`}
          actionText="Reset Search & Filters"
          onAction={resetFilters}
        />
      ) : (
        /* Horizontal Scrolling Kanban Canvas */
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-start gap-3.5 min-w-[1400px]">
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
      )}
    </div>
  );
}
