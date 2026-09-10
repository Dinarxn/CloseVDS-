import React from "react";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center bg-[#121216]/60 border border-dashed border-white/[0.12] rounded-xl space-y-4 relative overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

      {icon ? (
        <div className="w-12 h-12 rounded-xl bg-[#181820] border border-white/[0.08] flex items-center justify-center text-zinc-300 text-xl shadow-inner">
          {icon}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-[#181820] border border-white/[0.08] flex items-center justify-center text-zinc-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}

      <div className="space-y-1.5 max-w-sm relative z-10">
        <h4 className="text-sm font-semibold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>

      {action && <div className="pt-2 relative z-10">{action}</div>}
    </div>
  );
}
