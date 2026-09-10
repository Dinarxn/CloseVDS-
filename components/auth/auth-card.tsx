import React from "react";

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuthCard({ children, className = "", ...props }: AuthCardProps) {
  return (
    <div
      className={`w-full bg-[#121217] border border-white/[0.12] rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_8px_40px_rgba(0,0,0,0.7)] relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Subtle top light edge reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
