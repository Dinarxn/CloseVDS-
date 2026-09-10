import React from "react";

export interface AuthFooterProps {
  children?: React.ReactNode;
}

export function AuthFooter({ children }: AuthFooterProps) {
  return (
    <div className="space-y-4 pt-2 text-center text-xs text-[#737373]">
      {children && <div className="space-y-2">{children}</div>}
      <div className="text-[10px] text-[#404040]">
        <span>© closeVDS — AI Client Acquisition OS</span>
      </div>
    </div>
  );
}
