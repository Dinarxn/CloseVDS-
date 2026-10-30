import React from "react";
import { SpinnerIcon } from "./icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent" | "success";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles: Obsidian Precision geometric rhythm, active press, accessible focus
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7D39EB] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-[0.98] select-none shrink-0";

    // Standardized variants aligned with Black + Violet + Lime + White design system
    const variantStyles = {
      primary:
        "bg-[#7D39EB] text-white hover:bg-[#6C2FD1] active:bg-[#5D25B8] shadow-sm font-semibold border border-[#8F52F5]",
      secondary:
        "bg-surface-card text-zinc-200 border border-white/[0.08] hover:bg-surface-card-hover hover:text-white hover:border-white/[0.16] shadow-xs active:bg-[#1a1a24]",
      outline:
        "bg-transparent text-zinc-300 border border-white/[0.12] hover:bg-white/[0.05] hover:text-white hover:border-white/[0.22] active:bg-white/[0.08]",
      ghost:
        "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent active:bg-white/[0.10]",
      destructive:
        "bg-rose-950/30 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50 hover:text-rose-100 hover:border-rose-700/80 shadow-xs active:bg-rose-900/70",
      accent:
        "bg-[#C6FF33] text-black font-semibold hover:bg-[#B5ED28] active:bg-[#A3DC1C] shadow-sm border border-[#D5FF66]",
      success:
        "bg-[#C6FF33] text-black font-semibold hover:bg-[#B5ED28] active:bg-[#A3DC1C] shadow-sm border border-[#D5FF66]",
    };

    // Standardized sizes (xs=h-7, sm=h-8, md=h-9, lg=h-10)
    const sizeStyles = {
      xs: "h-7 px-2.5 text-[11px] gap-1.5",
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-3.5 text-xs font-medium gap-2",
      lg: "h-10 px-4 text-sm font-semibold gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <SpinnerIcon size={14} className="-ml-0.5 text-current animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
