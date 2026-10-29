"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface WorkflowStep {
  name: string;
  href: string;
  stepNumber: string;
  description: string;
}

export const ACQUISITION_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    name: "Discover",
    href: "/dashboard",
    stepNumber: "01",
    description: "closeBDS Prospect Discovery",
  },
  {
    name: "Lead Pool",
    href: "/leads",
    stepNumber: "02",
    description: "Central Acquisition Pool",
  },
  {
    name: "Operations",
    href: "/operations",
    stepNumber: "03",
    description: "Work Queue & Approvals",
  },
  {
    name: "AI Calling",
    href: "/calling",
    stepNumber: "04",
    description: "Grounded Voice Agents",
  },
  {
    name: "CRM Pipeline",
    href: "/crm",
    stepNumber: "05",
    description: "Deals & Conversions",
  },
  {
    name: "Analytics",
    href: "/analytics",
    stepNumber: "06",
    description: "Performance Telemetry",
  },
];

export function AcquisitionWorkflowNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Acquisition Workflow"
      className="border-b border-white/[0.07] bg-surface-panel/85 backdrop-blur-xl py-1.5 px-4 md:px-6 relative z-20"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Left Section Label */}
        <div className="flex items-center gap-2 mr-1 shrink-0 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
            Acquisition Architecture
          </span>
        </div>

        {/* Stepper Pipeline */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {ACQUISITION_WORKFLOW_STEPS.map((step, idx) => {
            const isActive =
              step.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(step.href);

            return (
              <React.Fragment key={step.href}>
                <Link
                  href={step.href}
                  className={`group flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all duration-150 shrink-0 cursor-pointer active:scale-95 ${
                    isActive
                      ? "bg-white/[0.08] border border-white/[0.12] text-white font-medium shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]"
                  }`}
                  title={`${step.name}: ${step.description}`}
                >
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                      isActive
                        ? "bg-white/[0.12] text-white font-medium"
                        : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-400"
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <span className="tracking-tight whitespace-nowrap">{step.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </Link>

                {idx < ACQUISITION_WORKFLOW_STEPS.length - 1 && (
                  <svg
                    className="w-3.5 h-3.5 text-zinc-700/80 shrink-0 select-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
