import React from "react";

export interface AuthFooterProps {
  children?: React.ReactNode;
}

export function AuthFooter({ children }: AuthFooterProps) {
  return (
    <div className="space-y-4 pt-3 text-center text-xs text-zinc-400">
      {children && <div className="space-y-2">{children}</div>}
      <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-500 font-mono flex items-center justify-center gap-2">
        <span>CloseVDS</span>
        <span>•</span>
        <span>AI Client Acquisition OS</span>
      </div>
    </div>
  );
}
