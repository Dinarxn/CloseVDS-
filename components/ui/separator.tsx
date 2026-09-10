import React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
  className = "",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={`bg-[#404040] shrink-0 ${
        orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full"
      } ${className}`}
      {...props}
    />
  );
}
