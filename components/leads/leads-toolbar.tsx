"use client";

import React from "react";
import { Select } from "@/components/ui/select";
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
  onImportLeads?: () => void;
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
  onImportLeads,
}: LeadsToolbarProps) {
  return (
    <div className="relative p-2.5 sm:p-3 bg-[#0A0A0E] border border-white/[0.08] rounded-xl shadow-xs backdrop-blur-sm">
      {/* Top specular hairline highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Search Bar - Primary Workspace Control */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search leads by company, contact, or location..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-7 bg-[#111116] text-white text-xs rounded-lg border border-white/[0.08] placeholder-[#8E8E9F] focus:placeholder-white/60 focus:outline-none focus:border-[#7D39EB]/60 focus:ring-1 focus:ring-[#7D39EB] transition-colors font-sans"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#8E8E9F]">
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#8E8E9F] hover:text-white transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Filter Toggle */}
          <button
            onClick={onToggleFilter}
            className={`h-9 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isFilterOpen
                ? "bg-[#7D39EB] text-white border-[#7D39EB] shadow-[0_0_16px_rgba(125,57,235,0.35)] font-semibold"
                : "bg-[#111116] hover:bg-[#171720] text-[#CBCBD6] hover:text-white border-white/[0.08] hover:border-white/[0.16]"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none ${
                isFilterOpen ? "bg-white text-black font-bold" : "bg-[#C6FF33] text-black font-bold"
              }`}>
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="w-38 sm:w-42 shrink-0">
            <Select
              id="leads-sort-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as LeadSortOption)}
              options={[
                { value: "discovered_desc", label: "Date: Newest" },
                { value: "discovered_asc", label: "Date: Oldest" },
                { value: "company_asc", label: "Company: A to Z" },
                { value: "score_desc", label: "Score: Highest" },
                { value: "score_asc", label: "Score: Lowest" },
              ]}
              className="h-9 text-xs bg-[#111116] border-white/[0.08] text-[#CBCBD6]"
            />
          </div>

          {/* Subtle separator */}
          <div className="hidden sm:block h-4 w-[1px] bg-white/[0.08] mx-0.5" />

          {/* View Mode Toggle */}
          <div className="flex items-center border border-white/[0.08] rounded-lg overflow-hidden bg-[#111116] p-0.5 h-9">
            <button
              onClick={() => onViewModeChange("table")}
              className={`p-1 px-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#7D39EB]/20 text-white font-medium border border-[#7D39EB]/40 shadow-xs"
                  : "text-[#8E8E9F] hover:text-[#CBCBD6]"
              }`}
              aria-label="Table view"
              title="Table view"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm1 2v2h14V4H1zm0 3v2h14V7H1zm0 3v2h14v-2H1zm0 3v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1H1z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("cards")}
              className={`p-1 px-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#7D39EB]/20 text-white font-medium border border-[#7D39EB]/40 shadow-xs"
                  : "text-[#8E8E9F] hover:text-[#CBCBD6]"
              }`}
              aria-label="Cards view"
              title="Cards view"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("pipeline")}
              className={`p-1 px-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === "pipeline"
                  ? "bg-[#7D39EB]/20 text-white font-medium border border-[#7D39EB]/40 shadow-xs"
                  : "text-[#8E8E9F] hover:text-[#CBCBD6]"
              }`}
              aria-label="Pipeline view"
              title="Pipeline view"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <rect x="3" y="4" width="5" height="16" rx="1" />
                <rect x="10" y="4" width="5" height="11" rx="1" />
                <rect x="17" y="4" width="5" height="14" rx="1" />
              </svg>
            </button>
          </div>

          {/* Subtle separator */}
          <div className="hidden sm:block h-4 w-[1px] bg-white/[0.08] mx-0.5" />

          {/* Action CTAs */}
          {onImportLeads && (
            <button
              onClick={onImportLeads}
              className="h-9 px-3.5 rounded-lg bg-[#7D39EB] hover:bg-[#6C2FD1] text-white text-xs font-semibold font-sans tracking-tight transition-all flex items-center gap-1.5 shadow-[0_0_20px_-4px_rgba(125,57,235,0.4)] active:scale-[0.98] cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import Leads</span>
              <span className="text-xs">→</span>
            </button>
          )}

          <button
            onClick={onFindLeads}
            className="h-9 px-3 rounded-lg bg-[#111116] hover:bg-[#171720] text-[#CBCBD6] hover:text-white border border-white/[0.08] hover:border-white/20 text-xs font-medium font-sans tracking-tight transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            title="Automated lead discovery"
          >
            <svg className="w-3.5 h-3.5 text-[#8E8E9F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Find Leads</span>
          </button>
        </div>
      </div>
    </div>
  );
}
