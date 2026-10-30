import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={`bg-white/[0.08] shrink-0 ${
          orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full"
        } ${className}`}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";
