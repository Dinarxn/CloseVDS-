import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, disabled, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[#d4d4d4] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          className={`w-full px-3 py-2 bg-[#0a0a0a] text-white text-sm rounded-md border ${
            error ? "border-white" : "border-[#404040]"
          } placeholder-[#737373] focus:outline-none focus:border-white focus:ring-1 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#d4d4d4] font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-[#737373]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
