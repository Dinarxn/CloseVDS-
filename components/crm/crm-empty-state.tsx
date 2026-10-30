import React from "react";
import { Button } from "@/components/ui/button";

export interface CrmEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function CrmEmptyState({
  title = "CRM Pipeline is empty",
  description = "Prospects will automatically populate and progress through these stages as they are discovered, qualified, approved, and contacted.",
  actionText,
  onAction,
  compact = false,
}: CrmEmptyStateProps) {
  if (compact) {
    return (
      <div className="py-8 px-4 text-center border border-dashed border-white/[0.08] rounded-xl bg-surface-card/40 space-y-1.5 transition-colors">
        <span className="text-[11px] font-mono text-[#CBCBD6] block font-medium">
          {title}
        </span>
        <span className="text-[10px] text-[#8E8E9F] block max-w-[220px] mx-auto leading-relaxed">
          {description}
        </span>
        {actionText && onAction && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="xs"
              onClick={onAction}
              className="text-[10px] font-mono border-white/[0.12] hover:border-[#7D39EB]/50 hover:text-white"
            >
              {actionText}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative p-8 sm:p-14 text-center border border-white/[0.08] rounded-xl bg-surface-panel space-y-4 shadow-xs overflow-hidden">
      {/* Precision specular top hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Clean icon node with Violet brand glow */}
      <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-white/[0.10] flex items-center justify-center mx-auto text-[#7D39EB] shadow-inner relative group">
        <div className="absolute inset-0 rounded-xl bg-[#7D39EB]/10 blur-sm pointer-events-none" />
        <svg className="w-5 h-5 text-[#7D39EB] relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] font-semibold block">
          Sales &amp; Opportunity Pipeline
        </span>
        <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs text-[#CBCBD6] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <div className="pt-1.5 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="text-xs font-mono px-4 h-8 bg-surface-card hover:bg-surface-elevated text-zinc-200 hover:text-white border-white/[0.12] hover:border-[#7D39EB]/60 transition-all cursor-pointer shadow-xs"
          >
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
