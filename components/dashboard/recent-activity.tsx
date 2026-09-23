"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface ActivityItem {
  id: string;
  type: "lead" | "call" | "crm";
  event: string;
  targetName: string;
  timestamp: string;
  status: string;
  statusVariant: "default" | "secondary" | "success" | "warning" | "danger" | "info";
  href: string;
}

export interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading: boolean;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const hasActivity = activities.length > 0;

  return (
    <div className="relative rounded-xl p-5 bg-[#09090f]/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4 backdrop-blur-sm">
      {/* Top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Live Telemetry Log
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">Recent Activity</h3>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Real-time event stream of prospect progression, qualification milestones, and voice calls.
          </p>
        </div>

        <Link
          href="/leads"
          className="group/link px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
        >
          <span>View All Activity</span>
          <span className="text-zinc-500 group-hover/link:text-white group-hover/link:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      <div>
        {!hasActivity && !isLoading ? (
          <div className="p-8 text-center bg-[#0c0c14]/60 border border-white/[0.06] rounded-xl space-y-2.5">
            <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-200">
              No acquisition activity yet
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Activity will appear as leads move through the acquisition pipeline.
            </p>
            <div className="pt-2">
              <Link
                href="/leads"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white text-zinc-200 hover:text-black border border-white/[0.10] hover:border-white text-xs font-mono font-medium transition-all shadow-sm"
              >
                <span>Open Leads</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((act) => (
              <Link
                key={act.id}
                href={act.href}
                className="group relative p-3.5 bg-[#0c0c14]/80 hover:bg-[#11111c] border border-white/[0.06] hover:border-white/[0.16] rounded-xl flex items-center justify-between gap-3 transition-all duration-150 block hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#141420] border border-white/[0.08] flex items-center justify-center text-zinc-400 shrink-0">
                    {act.type === "call" ? (
                      <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white tracking-tight truncate group-hover:text-zinc-100">
                      {act.event} • <span className="text-zinc-400 font-normal">{act.targetName}</span>
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {act.timestamp}
                    </p>
                  </div>
                </div>

                <Badge variant={act.statusVariant} size="sm" className="font-mono text-[9px] shrink-0">
                  {act.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
