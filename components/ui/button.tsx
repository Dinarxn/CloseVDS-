import React from "react";

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
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-2 focus-visible:outline-white/80 focus-visible:outline-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-[0.98] select-none";

    // Variants
    const variantStyles = {
      primary:
        "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.8)] font-semibold",
      secondary:
        "bg-[#18181f] text-zinc-200 border border-white/[0.08] hover:bg-[#20202a] hover:text-white hover:border-white/[0.16] shadow-sm",
      outline:
        "bg-transparent text-zinc-300 border border-white/[0.12] hover:bg-white/[0.04] hover:text-white hover:border-white/[0.24]",
      ghost:
        "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]",
      destructive:
        "bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 hover:text-rose-100 hover:border-rose-700",
      accent:
        "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_1px_8px_rgba(99,102,241,0.4)] font-semibold",
    };

    // Sizes
    const sizeStyles = {
      xs: "h-7 px-2.5 text-[11px] gap-1.5",
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs font-medium gap-2",
      lg: "h-11 px-5 text-sm font-semibold gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
