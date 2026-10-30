import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "standard" | "elevated" | "bordered" | "interactive";
  specular?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "standard",
      specular = true,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      standard: "bg-surface-card border border-white/[0.08] shadow-xs",
      elevated: "bg-surface-elevated border border-white/[0.12] shadow-md",
      bordered: "bg-transparent border border-white/[0.10]",
      interactive:
        "bg-surface-card border border-white/[0.08] hover:bg-surface-card-hover hover:border-[#7D39EB]/40 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.995]",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-5 text-white relative overflow-hidden transition-colors duration-150 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {/* Specular top hairline reflection */}
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
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={`space-y-1.5 mb-4 ${className}`} {...props}>
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", children, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-sm md:text-base font-semibold text-white tracking-tight ${className}`}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", children, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-xs text-zinc-400 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={`text-sm text-zinc-200 ${className}`} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center pt-4 border-t border-white/[0.06] mt-4 ${className}`}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";
