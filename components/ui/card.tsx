import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "standard" | "elevated" | "bordered" | "interactive";
  specular?: boolean;
}

export function Card({
  variant = "standard",
  specular = true,
  className = "",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    standard: "bg-surface-card border border-white/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.5)]",
    elevated: "bg-surface-elevated border border-white/[0.10] shadow-[0_4px_20px_rgba(0,0,0,0.6)]",
    bordered: "bg-transparent border border-white/[0.08]",
    interactive:
      "bg-surface-card border border-white/[0.07] hover:border-white/[0.16] hover:bg-surface-card-hover transition-all duration-150 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.5)] active:scale-[0.995]",
  };

  return (
    <div
      className={`rounded-xl p-5 text-white relative overflow-hidden transition-colors duration-150 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Consolidated specular top hairline reflection */}
      {specular && variant !== "bordered" && (
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-1.5 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-sm md:text-base font-semibold text-white tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-zinc-400 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-sm text-zinc-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center pt-4 border-t border-white/[0.06] mt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
