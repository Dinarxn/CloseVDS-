import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: "slash" | "chevron";
}

export function Breadcrumb({ items, className = "", separator = "chevron" }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-zinc-400 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                separator === "slash" ? (
                  <span className="text-zinc-600 select-none">/</span>
                ) : (
                  <svg
                    className="w-3 h-3 text-zinc-600 shrink-0 select-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )
              )}
              {isLast || !item.href ? (
                <span className="font-semibold text-white select-none">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors duration-150"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
