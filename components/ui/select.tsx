import React from "react";

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
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider"
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
            className={`w-full h-10 px-3 py-2 bg-[#0d0d12] text-white text-sm rounded-lg border appearance-none pr-9 transition-all duration-150 ${
              error
                ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                : "border-white/[0.12] hover:border-white/[0.22] focus:border-white focus:ring-1 focus:ring-white/40"
            } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-[#121216] text-zinc-500">
                {placeholder}
              </option>
            )}
            {children
              ? children
              : options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#121216] text-white">
                    {opt.label}
                  </option>
                ))}
            {!children && options.length === 0 && !placeholder && (
              <option value="" disabled className="bg-[#121216] text-zinc-500">
                No options available
              </option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-zinc-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
