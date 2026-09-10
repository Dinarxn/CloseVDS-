import React from "react";

export interface AuthHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function AuthHeader({ title, description, className = "" }: AuthHeaderProps) {
  return (
    <div className={`space-y-2 text-left ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 rounded-md bg-white text-zinc-950 font-bold flex items-center justify-center text-[10px] tracking-tighter">
          VDS
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">closeVDS OS</span>
      </div>
      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h1>
      {description && (
        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
