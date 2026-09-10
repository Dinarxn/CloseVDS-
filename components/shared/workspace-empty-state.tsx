import React from "react";
import { Button } from "@/components/ui/button";

export interface WorkspaceEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
  hint?: string;
  className?: string;
}

export function WorkspaceEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
  hint,
  className = "",
}: WorkspaceEmptyStateProps) {
  return (
    <div
      className={`p-8 sm:p-12 text-center bg-[#171717] border border-[#404040] rounded-lg flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {icon ? (
        <div className="p-3 bg-[#0a0a0a] border border-[#404040] rounded-full text-white">
          {icon}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full border border-dashed border-[#737373] flex items-center justify-center text-xs font-mono text-[#737373]">
          0
        </div>
      )}

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-[#737373] leading-relaxed">{description}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}

      {hint && (
        <div className="pt-2 text-[11px] font-mono text-[#737373] border-t border-[#404040]/40 max-w-sm">
          {hint}
        </div>
      )}
    </div>
  );
}
