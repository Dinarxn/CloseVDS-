import React from "react";

export interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({ label, className = "" }: AuthDividerProps) {
  if (!label) {
    return <div className={`h-px w-full bg-white/[0.08] ${className}`} />;
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/[0.08]" />
      </div>
      <div className="relative bg-surface-card px-3 text-[10px] uppercase tracking-widest font-mono font-medium text-zinc-500">
        {label}
      </div>
    </div>
  );
}
