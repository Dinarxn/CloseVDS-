import React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/[0.06] rounded-md ${className}`}
      {...props}
    />
  );
}
