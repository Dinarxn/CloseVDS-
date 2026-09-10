import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "solid"
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
    "inline-flex items-center font-medium rounded-full tracking-wide whitespace-nowrap shrink-0 transition-colors duration-150";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
  };

  const variantStyles = {
    default: "bg-[#181820] text-zinc-300 border border-white/[0.08]",
    secondary: "bg-[#131317] text-zinc-400 border border-white/[0.06]",
    outline: "bg-transparent text-zinc-400 border border-white/[0.12]",
    solid: "bg-white text-zinc-950 font-semibold shadow-sm",
    success: "bg-emerald-950/40 text-emerald-300 border border-emerald-800/60",
    warning: "bg-amber-950/40 text-amber-300 border border-amber-800/60",
    danger: "bg-rose-950/40 text-rose-300 border border-rose-800/60",
    info: "bg-sky-950/40 text-sky-300 border border-sky-800/60",
  };

  const dotColors = {
    default: "bg-zinc-400",
    secondary: "bg-zinc-500",
    outline: "bg-zinc-400",
    solid: "bg-zinc-950",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400",
    info: "bg-sky-400",
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
