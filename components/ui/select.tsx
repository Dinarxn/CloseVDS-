import React from "react";
import { ChevronDownIcon } from "./icons";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      placeholder,
      options = [],
      className = "",
      id,
      disabled,
      children,
      value,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[11px] font-medium text-zinc-300 tracking-wide select-none"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            value={value}
            className={`w-full h-9 px-3 bg-surface-panel text-white text-xs rounded-lg border appearance-none pr-8 transition-all duration-150 ${
              error
                ? "border-rose-500/80 focus:border-rose-500 focus-visible:ring-1 focus-visible:ring-rose-500/30"
                : "border-white/[0.08] hover:border-white/[0.16] focus:border-white/[0.30] focus-visible:ring-1 focus-visible:ring-white/20"
            } focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-surface-card text-zinc-500">
                {placeholder}
              </option>
            )}
            {children
              ? children
              : options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-surface-card text-zinc-200">
                    {opt.label}
                  </option>
                ))}
            {!children && options.length === 0 && !placeholder && (
              <option value="" disabled className="bg-surface-card text-zinc-500">
                No options available
              </option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
            <ChevronDownIcon size={14} />
          </div>
        </div>
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

Select.displayName = "Select";
