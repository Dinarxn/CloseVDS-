import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface WorkspaceErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onNavigateHome?: () => void;
  errorCode?: string;
}

export function WorkspaceErrorState({
  title = "Workspace Error",
  message = "An error occurred while loading this workspace component. Please try again or return to the overview.",
  onRetry,
  onNavigateHome,
  errorCode,
}: WorkspaceErrorStateProps) {
  return (
    <div
      role="alert"
      className="p-8 text-center bg-surface-panel border border-rose-500/25 rounded-xl flex flex-col items-center justify-center space-y-4 relative overflow-hidden"
    >
      {/* Specular top hairline reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent pointer-events-none" />

      <div className="flex items-center space-x-2 relative z-10">
        <Badge variant="danger" size="sm">
          Error
        </Badge>
        {errorCode && (
          <span className="text-[10px] font-mono text-zinc-400">
            CODE: {errorCode}
          </span>
        )}
      </div>

      <div className="space-y-1.5 max-w-md relative z-10">
        <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center space-x-3 pt-2 relative z-10">
        {onRetry && (
          <Button variant="primary" size="sm" onClick={onRetry}>
            Retry Operation
          </Button>
        )}
        {onNavigateHome && (
          <Button variant="outline" size="sm" onClick={onNavigateHome}>
            Return to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
