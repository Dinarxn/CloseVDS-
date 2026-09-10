import React from "react";

export interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({ label, className = "" }: AuthDividerProps) {
  if (!label) {
    return <div className={`h-px w-full bg-[#404040]/50 ${className}`} />;
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#404040]/50" />
      </div>
      <div className="relative bg-[#0a0a0a] px-3 text-[10px] uppercase tracking-wider font-semibold text-[#737373]">
        {label}
      </div>
    </div>
  );
}
