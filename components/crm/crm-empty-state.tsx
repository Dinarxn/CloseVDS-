import React from "react";

export interface CrmEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function CrmEmptyState({
  title = "CRM Pipeline is empty",
  description = "Prospects will automatically populate and progress through these stages as they are discovered, qualified, approved, and contacted.",
  actionText,
  onAction,
}: CrmEmptyStateProps) {
  return (
    <div className="relative p-8 sm:p-14 text-center border border-white/[0.07] rounded-xl bg-[#0d0d12] space-y-4 shadow-xs overflow-hidden">
      {/* Precision specular top hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Clean icon node */}
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400 shadow-inner">
        <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
          Sales &amp; Pipeline Engine
        </span>
        <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-mono px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white border border-white/[0.1] transition-all cursor-pointer"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
