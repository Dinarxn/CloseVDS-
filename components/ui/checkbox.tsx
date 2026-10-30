import React from "react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, disabled, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex items-start space-x-3 text-left">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            className={`w-4 h-4 bg-surface-panel border border-white/[0.16] rounded accent-[#7D39EB] text-[#7D39EB] checked:bg-[#7D39EB] checked:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] focus:ring-offset-0 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-sm leading-tight">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-xs font-medium text-zinc-200 select-none cursor-pointer disabled:cursor-not-allowed block"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
