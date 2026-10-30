import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface PageSkeletonProps {
  hasToolbar?: boolean;
  sectionsCount?: number;
}

export function PageSkeleton({
  hasToolbar = true,
  sectionsCount = 2,
}: PageSkeletonProps) {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading workspace">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28 bg-white/[0.08]" />
        <Skeleton className="h-7 w-48 bg-white/[0.08]" />
        <Skeleton className="h-4 w-96 max-w-full bg-white/[0.04]" />
      </div>

      {/* Toolbar Skeleton */}
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-surface-card border border-white/[0.08] rounded-xl">
          <Skeleton className="h-8 w-64 max-w-full bg-white/[0.06]" />
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Skeleton className="h-8 w-24 bg-white/[0.06]" />
            <Skeleton className="h-8 w-24 bg-white/[0.06]" />
          </div>
        </div>
      )}

      {/* Sections Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: sectionsCount }).map((_, i) => (
          <div key={i} className="p-5 bg-surface-card border border-white/[0.08] rounded-xl space-y-3">
            <Skeleton className="h-5 w-40 bg-white/[0.08]" />
            <Skeleton className="h-3 w-full bg-white/[0.04]" />
            <Skeleton className="h-3 w-3/4 bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-surface-card">
      {/* Table Header */}
      <div className="p-3.5 bg-surface-panel border-b border-white/[0.08] flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 bg-white/[0.08]" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/[0.04] p-2 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 py-2 px-2">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} className="h-3.5 flex-1 bg-white/[0.04]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface CardGridSkeletonProps {
  cards?: number;
}

export function CardGridSkeleton({ cards = 6 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="p-4 bg-surface-card border border-white/[0.08] rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-32 bg-white/[0.08]" />
            <Skeleton className="h-4 w-16 bg-white/[0.08]" />
          </div>
          <Skeleton className="h-3 w-full bg-white/[0.04]" />
          <Skeleton className="h-3 w-2/3 bg-white/[0.04]" />
          <div className="pt-2 border-t border-white/[0.04] flex justify-between">
            <Skeleton className="h-3 w-20 bg-white/[0.04]" />
            <Skeleton className="h-3 w-16 bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FunnelSkeleton() {
  return (
    <div className="p-5 bg-surface-card border border-white/[0.08] rounded-xl space-y-3">
      <Skeleton className="h-5 w-48 bg-white/[0.08]" />
      <Skeleton className="h-3 w-80 bg-white/[0.04]" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-3 bg-surface-panel border border-white/[0.06] rounded-xl flex justify-between items-center">
            <Skeleton className="h-3.5 w-32 bg-white/[0.08]" />
            <Skeleton className="h-3.5 w-16 bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
