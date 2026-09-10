import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AcquisitionKpis } from "@/types/analytics";

export interface AnalyticsKpiGridProps {
  kpis: AcquisitionKpis;
}

export function AnalyticsKpiGrid({ kpis }: AnalyticsKpiGridProps) {
  const cards = [
    {
      title: "Leads Discovered",
      value: kpis.leadsDiscovered.toString(),
      helper: "Total candidates crawled",
    },
    {
      title: "Qualification Rate",
      value: kpis.leadsDiscovered > 0 ? `${kpis.qualificationRate}%` : "—",
      helper: "Score ≥ 70 threshold",
    },
    {
      title: "Approved Dispatches",
      value: kpis.approvedDispatches.toString(),
      helper: "Gate 2 explicit approvals",
    },
    {
      title: "Reply Rate",
      value: kpis.approvedDispatches > 0 ? `${kpis.replyRate}%` : "—",
      helper: "Inbound positive responses",
    },
    {
      title: "Meetings Booked",
      value: kpis.meetingsBooked.toString(),
      helper: "Discovery calls scheduled",
    },
    {
      title: "Clients Closed",
      value: kpis.clientsClosed.toString(),
      helper: "Signed acquisition contracts",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <Card key={i} variant="standard" className="space-y-1">
          <CardHeader className="pb-1">
            <CardTitle className="text-[11px] font-medium text-[#737373] uppercase tracking-wider">
              {c.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-0.5">
            <div className="text-xl font-bold text-white tracking-tight">{c.value}</div>
            <div className="text-[10px] text-[#737373]">{c.helper}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
