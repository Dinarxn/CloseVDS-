"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LeadSortOption, LeadViewMode } from "@/types/leads";

export interface LeadsToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  activeFilterCount: number;
  sortOption: LeadSortOption;
  onSortChange: (val: LeadSortOption) => void;
  viewMode: LeadViewMode;
  onViewModeChange: (val: LeadViewMode) => void;
  onFindLeads: () => void;
}

export function LeadsToolbar({
  search,
  onSearchChange,
  isFilterOpen,
  onToggleFilter,
  activeFilterCount,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  onFindLeads,
}: LeadsToolbarProps) {
  return (
    <div className="p-4 bg-[#171717] border border-[#404040] rounded-lg space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search leads by company, contact, or location..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-8 bg-[#0a0a0a] text-white text-xs rounded-md border border-[#404040] placeholder-[#737373] focus:outline-none focus:border-white transition-colors"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#737373]">
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#737373] hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Filter Toggle */}
          <Button
            variant={isFilterOpen ? "primary" : "secondary"}
            size="sm"
            onClick={onToggleFilter}
            className="text-xs"
          >
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant={isFilterOpen ? "secondary" : "solid"} className="ml-1.5 px-1.5 py-0 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Sort Selector */}
          <div className="w-44">
            <Select
              id="leads-sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as LeadSortOption)}
              options={[
                { value: "discovered_desc", label: "Date: Newest first" },
                { value: "discovered_asc", label: "Date: Oldest first" },
                { value: "company_asc", label: "Company: A to Z" },
                { value: "score_desc", label: "Score: Highest first" },
                { value: "score_asc", label: "Score: Lowest first" },
              ]}
              className="h-8 text-xs py-1"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#404040] rounded-md overflow-hidden bg-[#0a0a0a]">
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-2 text-xs transition-colors ${
                viewMode === "table" ? "bg-white text-black font-semibold" : "text-[#737373] hover:text-white"
              }`}
              aria-label="Table view"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm1 2v2h14V4H1zm0 3v2h14V7H1zm0 3v2h14v-2H1zm0 3v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H1z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("cards")}
              className={`p-2 text-xs transition-colors ${
                viewMode === "cards" ? "bg-white text-black font-semibold" : "text-[#737373] hover:text-white"
              }`}
              aria-label="Cards view"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
              </svg>
            </button>
          </div>

          {/* Find Leads CTA */}
          <Button variant="primary" size="sm" onClick={onFindLeads} className="text-xs font-semibold">
            Find leads
          </Button>
        </div>
      </div>
    </div>
  );
}
