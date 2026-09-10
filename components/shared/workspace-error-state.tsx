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
      className="p-8 text-center bg-[#171717] border border-[#404040] rounded-lg flex flex-col items-center justify-center space-y-4"
    >
      <div className="flex items-center space-x-2">
        <Badge variant="outline">Error</Badge>
        {errorCode && (
          <span className="text-[10px] font-mono text-[#737373]">CODE: {errorCode}</span>
        )}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-[#737373] leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center space-x-3 pt-2">
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
