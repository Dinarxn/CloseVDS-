import React from "react";

export interface LeadsEmptyStateProps {
  onFindLeads?: () => void;
  onImportLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function LeadsEmptyState({ onFindLeads, onImportLeads, isFiltered, onClearFilters }: LeadsEmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="relative p-7 sm:p-8 text-center bg-[#0a0a0f] border border-white/[0.06] rounded-xl shadow-xs backdrop-blur-sm space-y-2.5">
        {/* Top specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

        <div className="w-9 h-9 mx-auto rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight">No matching leads</p>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          No prospects match the active filter criteria. Try adjusting or resetting your filters.
        </p>
        {onClearFilters && (
          <div className="pt-1.5">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium font-sans transition-all cursor-pointer shadow-xs"
            >
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Primary Workspace Ready Zero-Data State */}
      <div className="relative p-7 sm:p-9 text-center bg-[#0a0a0f] border border-white/[0.06] rounded-xl shadow-xs backdrop-blur-sm space-y-2.5">
        {/* Top specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

        <div className="w-9 h-9 mx-auto rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>

        <p className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight">No leads yet</p>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Your lead workspace is ready. Import your prospect list (.csv) or discover leads to begin qualification and outreach.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          {onImportLeads && (
            <button
              onClick={onImportLeads}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-100 text-black text-xs font-semibold font-sans tracking-tight shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import Leads</span>
              <span className="text-xs">→</span>
            </button>
          )}

          {onFindLeads && (
            <button
              onClick={onFindLeads}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium font-sans tracking-tight transition-all cursor-pointer shadow-xs"
            >
              <span>Find Leads</span>
            </button>
          )}
        </div>
      </div>

      {/* Acquisition OS Lifecycle System Footer (Quiet Surface) */}
      <div className="pt-2 text-center space-y-1 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-indigo-400/80" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-medium">
            Acquisition OS Lifecycle
          </p>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed max-w-md mx-auto">
          In future phases, the automated discovery engine will fetch candidate businesses, perform 4-factor deduplication, audit technical website gaps, and score relevance before queueing outreach drafts for your approval.
        </p>
      </div>
    </div>
  );
}
