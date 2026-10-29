import React from "react";

export interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuthCard({ children, className = "", ...props }: AuthCardProps) {
  return (
    <div
      className={`w-full bg-surface-card border border-white/[0.09] rounded-2xl p-7 sm:p-9 space-y-6 shadow-[0_16px_56px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-sm ${className}`}
      {...props}
    >
      {/* Specular top hairline reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.18] to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {/* Subtle bottom rim */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
