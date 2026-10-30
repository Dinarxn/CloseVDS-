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
      className={`p-8 sm:p-12 text-center bg-surface-card border border-subtle rounded-xl flex flex-col items-center justify-center space-y-4 relative overflow-hidden ${className}`}
    >
      {/* Specular top hairline reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

      {icon ? (
        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-inner">
          {icon}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/[0.08] flex items-center justify-center text-xs font-mono text-zinc-400">
          0
        </div>
      )}

      <div className="space-y-1.5 max-w-md relative z-10">
        <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
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
        <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-white/[0.08] max-w-sm relative z-10">
          {hint}
        </div>
      )}
    </div>
  );
}
