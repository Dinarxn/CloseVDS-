"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SAFETY_GOVERNANCE_ITEMS } from "./dashboard-constants";

export function SafetyGovernance() {
  return (
    <div className="relative rounded-xl p-5 bg-[#09090f]/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4 backdrop-blur-sm">
      {/* Top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Safety &amp; Governance
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Autonomous Safety &amp; Compliance Architecture
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            closeVDS enforces immutable opt-out suppression, human-in-the-loop permission gates, and provider circuit breakers.
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0 self-start sm:self-center flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          18-Gate Enclosure
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SAFETY_GOVERNANCE_ITEMS.map((item, idx) => (
          <Link
            key={idx}
            href={item.route}
            className="group relative p-3.5 bg-[#0c0c14]/80 hover:bg-[#11111c] border border-white/[0.06] hover:border-white/[0.18] rounded-xl space-y-2.5 flex flex-col justify-between transition-all duration-150 block hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          >
            {/* Top hairline highlight on hover */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white tracking-tight group-hover:text-zinc-100">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                {item.description}
              </p>
            </div>

            <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
              <Badge variant="outline" size="sm" className="text-[9px] font-mono border-white/[0.12] text-zinc-400">
                {item.badge}
              </Badge>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-medium">
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
