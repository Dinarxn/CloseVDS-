import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warning" | "destructive";
  title?: string;
  children: React.ReactNode;
}

export function Alert({
  variant = "default",
  title,
  className = "",
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    default: "bg-[#171717] border-[#404040] text-white",
    warning: "bg-[#0a0a0a] border-[#d4d4d4] text-white",
    destructive: "bg-[#0a0a0a] border-white text-white font-medium",
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-md border text-sm space-y-1 transition-colors duration-150 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {title && <h5 className="font-semibold text-xs uppercase tracking-wider">{title}</h5>}
      <div className="text-xs text-[#d4d4d4]">{children}</div>
    </div>
  );
}
