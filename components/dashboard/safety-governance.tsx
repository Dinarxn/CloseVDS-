"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SAFETY_GOVERNANCE_ITEMS } from "./dashboard-constants";

export function SafetyGovernance() {
  return (
    <div className="rounded-xl p-5 bg-[#0c0c12] border border-white/[0.07] shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Safety &amp; Governance
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Autonomous Safety &amp; Compliance Architecture
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            closeVDS enforces immutable opt-out suppression, human-in-the-loop permission gates, and provider circuit breakers.
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.06] shrink-0 self-start sm:self-center">
          18-Gate Enclosure
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SAFETY_GOVERNANCE_ITEMS.map((item, idx) => (
          <Link
            key={idx}
            href={item.route}
            className="p-3 bg-[#0e0e16] hover:bg-[#12121e] border border-white/[0.06] hover:border-white/[0.18] rounded-lg space-y-2 flex flex-col justify-between transition-all duration-150 group"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white tracking-tight group-hover:text-white">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
              <Badge variant="outline" size="sm" className="text-[9px] font-mono">
                {item.badge}
              </Badge>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                {item.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
