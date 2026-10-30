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
      <div className="relative p-7 sm:p-8 text-center bg-[#111116] border border-white/[0.08] rounded-xl shadow-xs backdrop-blur-sm space-y-2.5">
        {/* Top specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        <div className="w-9 h-9 mx-auto rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#8E8E9F]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-white tracking-tight">No matching leads</p>
        <p className="text-xs text-[#8E8E9F] max-w-sm mx-auto leading-relaxed">
          No prospects match the active filter criteria. Try adjusting or resetting your workspace filters.
        </p>
        {onClearFilters && (
          <div className="pt-1.5">
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7D39EB]/15 hover:bg-[#7D39EB]/25 text-[#CBCBD6] hover:text-white border border-[#7D39EB]/35 hover:border-[#7D39EB]/50 text-xs font-medium font-sans transition-all cursor-pointer shadow-xs"
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
      <div className="relative p-7 sm:p-9 text-center bg-[#111116] border border-white/[0.08] rounded-xl shadow-xs backdrop-blur-sm space-y-2.5">
        {/* Top specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        <div className="w-10 h-10 mx-auto rounded-xl bg-[#7D39EB]/10 border border-[#7D39EB]/25 flex items-center justify-center text-[#7D39EB] shadow-[0_0_20px_rgba(125,57,235,0.2)]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>

        <p className="text-sm sm:text-base font-semibold text-white tracking-tight">No leads yet</p>
        <p className="text-xs text-[#8E8E9F] max-w-sm mx-auto leading-relaxed">
          Your lead workspace is ready. Import your prospect list (.csv) or discover businesses to begin automated gap audits, AI qualification, and direct outreach.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
          {onImportLeads && (
            <button
              onClick={onImportLeads}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7D39EB] hover:bg-[#6C2FD1] text-white text-xs font-semibold font-sans tracking-tight shadow-[0_0_20px_-4px_rgba(125,57,235,0.4)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Import Leads</span>
              <span className="text-xs">→</span>
            </button>
          )}

          {onFindLeads && (
            <button
              onClick={onFindLeads}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#111116] hover:bg-[#171720] text-[#CBCBD6] hover:text-white border border-white/[0.08] hover:border-white/20 text-xs font-medium font-sans tracking-tight transition-all cursor-pointer shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-[#8E8E9F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Find Leads</span>
            </button>
          )}
        </div>
      </div>

      {/* Acquisition OS Lifecycle System Footer (Quiet Surface) */}
      <div className="pt-2 text-center space-y-1 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7D39EB]" />
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-medium">
            Acquisition Intelligence Lifecycle
          </p>
        </div>
        <p className="text-[11px] text-[#565668] leading-relaxed max-w-md mx-auto">
          The acquisition engine ingests candidate businesses, performs multi-factor deduplication, audits technical website gaps, and scores relevance before queueing outreach drafts for your approval.
        </p>
      </div>
    </div>
  );
}
