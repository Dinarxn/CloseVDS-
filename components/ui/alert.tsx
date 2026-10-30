import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warning" | "destructive" | "success";
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
    default: "bg-surface-panel border-white/[0.08] text-zinc-300",
    warning: "bg-amber-950/20 border-amber-500/25 text-amber-200",
    destructive: "bg-rose-950/20 border-rose-500/30 text-rose-200 font-medium",
    success: "bg-[#C6FF33]/10 border-[#C6FF33]/25 text-[#C6FF33]",
  };

  const descriptionStyles = {
    default: "text-zinc-400",
    warning: "text-amber-200/80",
    destructive: "text-rose-200/80",
    success: "text-[#C6FF33]/90",
  };

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border text-sm space-y-1 transition-colors duration-150 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {title && <h5 className="font-mono font-semibold text-xs uppercase tracking-wider">{title}</h5>}
      <div className={`text-xs ${descriptionStyles[variant]}`}>{children}</div>
    </div>
  );
}
