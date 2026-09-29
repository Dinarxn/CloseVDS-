import React from "react";
import { Breadcrumb, BreadcrumbItem } from "@/components/layout/breadcrumb";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`space-y-1.5 pb-3 border-b border-white/[0.05] ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="mb-1" />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-semibold tracking-tight text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed mt-0.5 font-normal">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
