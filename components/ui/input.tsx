import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-medium text-zinc-300 tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full h-9 px-3 bg-[#0D0D12] text-white text-xs rounded-lg border transition-all duration-150 ${
            error
              ? "border-rose-500/80 focus:border-rose-500 focus-visible:ring-1 focus-visible:ring-rose-500/30"
              : "border-white/[0.08] hover:border-white/[0.16] focus:border-white/[0.30] focus-visible:ring-1 focus-visible:ring-white/20"
          } placeholder:text-zinc-500 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-rose-400 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
