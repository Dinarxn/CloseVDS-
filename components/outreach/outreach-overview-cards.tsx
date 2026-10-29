"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OutreachOverviewStats } from "@/types/outreach";

export interface OutreachOverviewCardsProps {
  stats: OutreachOverviewStats;
  isLoading?: boolean;
}

export function OutreachOverviewCards({ stats, isLoading = false }: OutreachOverviewCardsProps) {
  const cards = [
    {
      label: "Pending Review",
      count: stats.pendingApproval,
      subtext: "Gate 1/2: Awaiting operator approval",
      badge: "Pending",
      badgeVariant: stats.pendingApproval > 0 ? ("warning" as const) : ("outline" as const),
      accentBorder: stats.pendingApproval > 0 ? "border-amber-500/30" : "border-white/[0.08]",
      indicatorColor: "bg-amber-400",
    },
    {
      label: "Approved & Scheduled",
      count: stats.approvedQueue,
      subtext: "Ready for delivery window dispatch",
      badge: "Approved",
      badgeVariant: stats.approvedQueue > 0 ? ("solid" as const) : ("outline" as const),
      accentBorder: stats.approvedQueue > 0 ? "border-white/[0.20]" : "border-white/[0.08]",
      indicatorColor: "bg-white",
    },
    {
      label: "Active Sequences",
      count: stats.sentActive,
      subtext: "Touchpoints dispatched & awaiting reply",
      badge: "Sent",
      badgeVariant: stats.sentActive > 0 ? ("success" as const) : ("outline" as const),
      accentBorder: stats.sentActive > 0 ? "border-emerald-500/30" : "border-white/[0.08]",
      indicatorColor: "bg-emerald-400",
    },
    {
      label: "Suppression & Opt-Outs",
      count: stats.suppressed,
      subtext: "Regulatory suppressions active",
      badge: "Suppressed",
      badgeVariant: stats.suppressed > 0 ? ("danger" as const) : ("outline" as const),
      accentBorder: stats.suppressed > 0 ? "border-rose-500/30" : "border-white/[0.08]",
      indicatorColor: "bg-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((c, idx) => (
        <Card
          key={idx}
          className={`relative p-4 rounded-xl bg-surface-card border ${c.accentBorder} shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all hover:border-white/[0.16] hover:bg-surface-card-hover`}
        >
          {/* Specular hairline top reflection */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${c.indicatorColor} shrink-0`} />
              <span className="text-xs font-medium text-zinc-300 font-sans tracking-tight">{c.label}</span>
            </div>
            <Badge variant={c.badgeVariant} size="sm" className="font-mono uppercase text-[10px]">
              {c.badge}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            {isLoading ? (
              <div className="h-7 w-12 bg-white/[0.06] rounded animate-pulse my-0.5" />
            ) : (
              <span className="text-2xl font-bold font-mono tracking-tight tabular-nums text-white">
                {c.count}
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 mt-1.5 leading-snug font-sans">
            {c.subtext}
          </p>
        </Card>
      ))}
    </div>
  );
}
