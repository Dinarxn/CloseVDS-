import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "solid"
    | "brand"
    | "violet"
    | "success"
    | "warning"
    | "danger"
    | "info";
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full tracking-wide whitespace-nowrap shrink-0 transition-colors select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1.5 leading-none",
    md: "px-2.5 py-0.5 text-[11px] gap-1.5 leading-tight",
  };

  const variantStyles = {
    default: "bg-surface-card text-zinc-200 border border-white/[0.08]",
    secondary: "bg-white/[0.05] text-zinc-300 border border-white/[0.06]",
    outline: "bg-transparent text-zinc-300 border border-white/[0.12]",
    solid: "bg-white text-zinc-950 font-semibold shadow-xs border border-white",
    brand: "bg-[#7D39EB]/15 text-[#B788FF] border border-[#7D39EB]/35",
    violet: "bg-[#7D39EB]/15 text-[#B788FF] border border-[#7D39EB]/35",
    success: "bg-[#C6FF33]/15 text-[#C6FF33] border border-[#C6FF33]/30",
    warning: "bg-amber-950/30 text-amber-300 border border-amber-500/25",
    danger: "bg-rose-950/30 text-rose-300 border border-rose-500/25",
    info: "bg-cyan-950/30 text-cyan-300 border border-cyan-500/25",
  };

  const dotColors = {
    default: "bg-zinc-400",
    secondary: "bg-zinc-500",
    outline: "bg-zinc-400",
    solid: "bg-zinc-950",
    brand: "bg-[#7D39EB]",
    violet: "bg-[#7D39EB]",
    success: "bg-[#C6FF33]",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-cyan-400",
  };

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      {children}
    </div>
  );
}
