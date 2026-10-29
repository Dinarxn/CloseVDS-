import React from "react";

export interface AuthHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function AuthHeader({ title, description, className = "" }: AuthHeaderProps) {
  return (
    <div className={`space-y-2.5 text-left ${className}`}>
      <div className="flex items-center space-x-2.5">
        <div className="w-6 h-6 rounded-md bg-white text-zinc-950 font-bold flex items-center justify-center text-[10px] tracking-tighter shadow-sm">
          <svg className="w-3.5 h-3.5 text-zinc-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-medium">
          CloseVDS OS
        </span>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
        {title}
      </h1>
      {description && (
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
