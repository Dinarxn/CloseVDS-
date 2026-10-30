"use client";

import React from "react";
import Link from "next/link";

export interface TelemetryMetrics {
  totalLeads: number | null;
  qualifiedLeads: number | null;
  qualificationRate: number | null;
  readyToCallCount: number | null;
  callsTodayCount: number | null;
  approvalRequiredCount: number | null;
  meetingsCount: number | null;
  isLoading: boolean;
}

export interface AcquisitionHealthStripProps {
  metrics: TelemetryMetrics;
}

export function AcquisitionHealthStrip({ metrics }: AcquisitionHealthStripProps) {
  const {
    totalLeads,
    qualifiedLeads,
    qualificationRate,
    readyToCallCount,
    callsTodayCount,
    approvalRequiredCount,
    meetingsCount,
    isLoading,
  } = metrics;

  const hasApprovalPending = Boolean(approvalRequiredCount && approvalRequiredCount > 0);

  const cards = [
    {
      id: "leads",
      label: "Total Leads",
      value: isLoading ? "—" : totalLeads !== null ? totalLeads.toString() : "0",
      secondary: totalLeads && totalLeads > 0 ? `${totalLeads} in prospect pool` : "No prospects in pool",
      href: "/leads",
      dotClass: "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.7)]",
      badgeText: "Pool",
      valueColor: "text-white",
      hoverBorder: "group-hover:border-[#C6FF33]/30",
      icon: (
        <svg className="w-3.5 h-3.5 text-[#8E8E9F] group-hover:text-[#C6FF33] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "qualified",
      label: "Qualified Leads",
      value: isLoading ? "—" : qualifiedLeads !== null ? qualifiedLeads.toString() : "0",
      secondary:
        qualificationRate !== null && qualificationRate > 0
          ? `${qualificationRate}% ICP match rate`
          : "0% ICP verification",
      href: "/leads",
      dotClass: "bg-[#7D39EB] shadow-[0_0_8px_rgba(125,57,235,0.7)]",
      badgeText: qualificationRate !== null && qualificationRate > 0 ? `${qualificationRate}%` : "ICP",
      valueColor: "text-white",
      hoverBorder: "group-hover:border-[#7D39EB]/40",
      icon: (
        <svg className="w-3.5 h-3.5 text-[#8E8E9F] group-hover:text-[#7D39EB] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "ready_to_call",
      label: "Ready to Call",
      value: isLoading ? "—" : readyToCallCount !== null ? readyToCallCount.toString() : "0",
      secondary: "Pre-flight safety passed",
      href: "/calling/calls",
      dotClass: "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.7)]",
      badgeText: "Cleared",
      valueColor: "text-white",
      hoverBorder: "group-hover:border-[#C6FF33]/30",
      icon: (
        <svg className="w-3.5 h-3.5 text-[#8E8E9F] group-hover:text-[#C6FF33] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      id: "calls_today",
      label: "Calls Today",
      value: isLoading ? "—" : callsTodayCount !== null ? callsTodayCount.toString() : "0",
      secondary: hasApprovalPending
        ? `${approvalRequiredCount} pending approval`
        : "Human approval active",
      href: "/calling/calls",
      dotClass: hasApprovalPending
        ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
        : "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.7)]",
      badgeText: hasApprovalPending ? "Action" : "Live",
      valueColor: "text-white",
      hoverBorder: hasApprovalPending ? "group-hover:border-amber-400/40" : "group-hover:border-[#C6FF33]/30",
      icon: (
        <svg className="w-3.5 h-3.5 text-[#8E8E9F] group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "meetings",
      label: "Meetings",
      value: isLoading ? "—" : meetingsCount !== null ? meetingsCount.toString() : "0",
      secondary: "From completed calls",
      href: "/crm",
      dotClass: "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.7)]",
      badgeText: "Booked",
      valueColor: meetingsCount && meetingsCount > 0 ? "text-[#C6FF33]" : "text-white",
      hoverBorder: "group-hover:border-[#C6FF33]/40",
      icon: (
        <svg className="w-3.5 h-3.5 text-[#8E8E9F] group-hover:text-[#C6FF33] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={card.href}
          className={`group relative rounded-xl p-4 bg-surface-card hover:bg-surface-card-hover border border-white/[0.08] ${card.hoverBorder} transition-all duration-150 cursor-pointer block focus:outline-none focus:ring-1 focus:ring-[#7D39EB]/40 hover:-translate-y-0.5 shadow-xs overflow-hidden select-none`}
        >
          {/* Specular Top Hairline */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

          {/* Top Line: Icon + Micro Label + Status Dot & Arrow */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded bg-white/[0.04] border border-white/[0.08] shrink-0 group-hover:border-white/[0.16] transition-colors">
                {card.icon}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-semibold group-hover:text-[#CBCBD6] transition-colors truncate">
                {card.label}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${card.dotClass}`} />
              <svg
                className="w-3 h-3 text-[#565668] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
          </div>

          {/* Bold Tabular Numeral */}
          <div className="mb-1.5">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${card.valueColor}`}>
              {card.value}
            </span>
          </div>

          {/* Secondary Subtext with Micro Badge */}
          <div className="flex items-center justify-between gap-1.5">
            <p className="text-[11px] font-mono text-[#8E8E9F] group-hover:text-[#CBCBD6] transition-colors truncate">
              {card.secondary}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
