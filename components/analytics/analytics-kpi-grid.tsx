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
    },
    {
      title: "Qualification Rate",
      value: kpis.leadsDiscovered > 0 ? `${kpis.qualificationRate}%` : "—",
      helper: "Score ≥ 70 threshold",
      isPrimary: false,
    },
    {
      title: "Approved Dispatches",
      value: kpis.approvedDispatches.toLocaleString(),
      helper: "Gate 2 explicit approvals",
      isPrimary: false,
    },
    {
      title: "Reply Rate",
      value: kpis.approvedDispatches > 0 ? `${kpis.replyRate}%` : "—",
      helper: "Inbound positive responses",
      isPrimary: false,
    },
    {
      title: "Meetings Booked",
      value: kpis.meetingsBooked.toLocaleString(),
      helper: "Discovery calls scheduled",
      isPrimary: kpis.meetingsBooked > 0,
    },
    {
      title: "Clients Closed",
      value: kpis.clientsClosed.toLocaleString(),
      helper: "Signed acquisition contracts",
      isPrimary: kpis.clientsClosed > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-4 space-y-1.5 shadow-xs overflow-hidden transition-colors hover:border-white/[0.14]"
        >
          {/* Top hairline reflection */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block line-clamp-1 font-medium">
            {c.title}
          </span>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums ${c.isPrimary ? "text-emerald-400" : "text-white"}`}>
            {c.value}
          </div>
          <span className="text-[10px] text-zinc-400 block line-clamp-1">
            {c.helper}
          </span>
        </div>
      ))}
    </div>
  );
}
