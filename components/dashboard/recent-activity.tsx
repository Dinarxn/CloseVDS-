"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card variant="standard" className="space-y-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Live Telemetry Log
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <Link href="/leads">
            <Button size="sm" variant="secondary" className="text-xs">
              View All Activity
            </Button>
          </Link>
        </div>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Real-time event stream of prospect progression, qualification milestones, and voice calls.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!hasActivity && !isLoading ? (
          <div className="p-8 text-center bg-[#0d0d12] border border-dashed border-white/[0.08] rounded-xl space-y-3">
            <div className="w-9 h-9 mx-auto rounded-lg bg-[#14141c] border border-white/[0.08] flex items-center justify-center text-zinc-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              No acquisition activity yet
            </p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Activity will appear here as leads move through your acquisition pipeline.
            </p>
            <div className="pt-2">
              <Link href="/leads">
                <Button size="sm" variant="secondary">
                  Open Leads
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((act) => (
              <Link
                key={act.id}
                href={act.href}
                className="p-3 bg-[#0d0d12] border border-white/[0.06] hover:border-white/[0.14] hover:bg-[#111118] rounded-xl flex items-center justify-between gap-3 transition-all duration-150 group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#151520] border border-white/[0.08] flex items-center justify-center text-zinc-400 shrink-0">
                    {act.type === "call" ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white tracking-tight truncate group-hover:text-white">
                      {act.event} • <span className="text-zinc-400 font-normal">{act.targetName}</span>
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500">
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
      </CardContent>
    </Card>
  );
}
