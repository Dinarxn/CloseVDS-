"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SAFETY_GOVERNANCE_ITEMS } from "./dashboard-constants";

export function SafetyGovernance() {
  return (
    <div className="relative rounded-xl p-5 bg-surface-panel border border-white/[0.08] shadow-xs space-y-4 overflow-hidden">
      {/* Specular Top Hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-semibold">
              Safety &amp; Governance
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            Autonomous Safety &amp; Compliance Architecture
          </h3>
          <p className="text-xs text-[#8E8E9F] mt-0.5 leading-relaxed">
            closeVDS enforces immutable opt-out suppression, human-in-the-loop permission gates, and provider circuit breakers.
          </p>
        </div>

        <span className="text-xs font-mono font-medium text-[#C6FF33] px-3 py-1 rounded-lg bg-[#C6FF33]/15 border border-[#C6FF33]/30 shrink-0 self-start sm:self-center flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_#C6FF33]" />
          18-Gate Enclosure
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {SAFETY_GOVERNANCE_ITEMS.map((item, idx) => (
          <Link
            key={idx}
            href={item.route}
            className="group relative p-3.5 bg-surface-card hover:bg-surface-card-hover border border-white/[0.07] hover:border-white/[0.18] rounded-xl space-y-2.5 flex flex-col justify-between transition-all duration-150 block hover:-translate-y-0.5 shadow-xs"
          >
            {/* Specular hairline on hover */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white tracking-tight group-hover:text-[#B788FF] transition-colors">
                  {item.title}
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E9F] leading-relaxed group-hover:text-[#CBCBD6] transition-colors">
                {item.description}
              </p>
            </div>

            <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
              <Badge variant="outline" size="sm" className="text-[9px] font-mono border-white/[0.12] text-[#8E8E9F]">
                {item.badge}
              </Badge>
              <span className="text-[10px] font-mono text-[#C6FF33] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_#C6FF33]" />
                {item.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
