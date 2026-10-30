import React from "react";
import { AcquisitionKpis } from "@/types/analytics";

export interface AnalyticsKpiGridProps {
  kpis: AcquisitionKpis;
}

export function AnalyticsKpiGrid({ kpis }: AnalyticsKpiGridProps) {
  const cards = [
    {
      title: "Leads Discovered",
      value: kpis.leadsDiscovered.toLocaleString(),
      helper: "Total candidates crawled",
      isPrimary: false,
      accentBorder: "border-white/[0.08]",
    },
    {
      title: "Qualification Rate",
      value: kpis.leadsDiscovered > 0 ? `${kpis.qualificationRate}%` : "—",
      helper: "Score ≥ 70 threshold",
      isPrimary: false,
      accentBorder: "border-white/[0.08]",
    },
    {
      title: "Approved Dispatches",
      value: kpis.approvedDispatches.toLocaleString(),
      helper: "Gate 2 explicit approvals",
      isPrimary: kpis.approvedDispatches > 0,
      accentBorder: kpis.approvedDispatches > 0 ? "border-[#7D39EB]/30" : "border-white/[0.08]",
    },
    {
      title: "Reply Rate",
      value: kpis.approvedDispatches > 0 ? `${kpis.replyRate}%` : "—",
      helper: "Inbound positive responses",
      isPrimary: false,
      accentBorder: "border-white/[0.08]",
    },
    {
      title: "Meetings Booked",
      value: kpis.meetingsBooked.toLocaleString(),
      helper: "Discovery calls scheduled",
      isPrimary: kpis.meetingsBooked > 0,
      accentBorder: kpis.meetingsBooked > 0 ? "border-[#C6FF33]/30" : "border-white/[0.08]",
    },
    {
      title: "Clients Closed",
      value: kpis.clientsClosed.toLocaleString(),
      helper: "Signed acquisition contracts",
      isPrimary: kpis.clientsClosed > 0,
      accentBorder: kpis.clientsClosed > 0 ? "border-[#C6FF33]/40 shadow-[0_0_15px_rgba(198,255,51,0.15)]" : "border-white/[0.08]",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((c, i) => (
        <div
          key={i}
          className={`relative rounded-xl border ${c.accentBorder} bg-surface-card p-4 space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-150 hover:border-white/[0.16] hover:bg-surface-card-hover group`}
        >
          {/* Top hairline reflection */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block truncate font-medium">
              {c.title}
            </span>
            {c.isPrimary && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shrink-0" />
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums text-white">
            {c.value}
          </div>

          <span className="text-[11px] text-zinc-400 block truncate font-sans">
            {c.helper}
          </span>
        </div>
      ))}
    </div>
  );
}