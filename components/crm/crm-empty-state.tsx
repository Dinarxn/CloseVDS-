import React from "react";

export function CrmEmptyState() {
  return (
    <div className="relative p-8 sm:p-12 text-center border border-white/[0.08] rounded-xl bg-[#09090f]/90 space-y-3.5 shadow-xs overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
          Acquisition Deals
        </span>
        <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
          CRM Pipeline is empty
        </h4>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Leads will automatically populate and progress through these stages as they are discovered, qualified, approved, and contacted.
        </p>
      </div>
    </div>
  );
}
