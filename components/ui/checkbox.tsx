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
            className={`w-4 h-4 bg-[#0a0a0a] border border-[#404040] rounded text-white focus:ring-1 focus:ring-white focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-sm leading-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className="font-medium text-white select-none cursor-pointer disabled:cursor-not-allowed"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-[#737373] mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
