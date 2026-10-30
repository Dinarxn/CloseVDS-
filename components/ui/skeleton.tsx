import React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse bg-white/[0.06] rounded-md ${className}`}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";
