import React from "react";
import { SpinnerIcon } from "./icons";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "accent";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
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
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-[0.98] select-none shrink-0";

    // Standardized variants aligned with Obsidian Precision palette
    const variantStyles = {
      primary:
        "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.9)] font-semibold border border-white/80",
      secondary:
        "bg-[#121218] text-zinc-200 border border-white/[0.08] hover:bg-[#171720] hover:text-white hover:border-white/[0.16] shadow-xs",
      outline:
        "bg-transparent text-zinc-300 border border-white/[0.10] hover:bg-white/[0.05] hover:text-white hover:border-white/[0.20]",
      ghost:
        "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent",
      destructive:
        "bg-rose-950/30 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50 hover:text-rose-100 hover:border-rose-700/80 shadow-xs",
      accent:
        "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_1px_8px_rgba(16,185,129,0.3)] font-semibold border border-emerald-400/80",
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
