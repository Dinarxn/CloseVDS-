"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface PreviewLead {
  id: string;
  businessName: string;
  domain?: string;
  city?: string;
  country?: string;
  status: string;
  leadScore?: { finalScore?: number } | null;
  createdAt: string;
}

export interface LeadDiscoveryCardProps {
  recentLeads?: PreviewLead[];
  isLoading?: boolean;
}

export function LeadDiscoveryCard({ recentLeads = [], isLoading = false }: LeadDiscoveryCardProps) {
  const hasLeads = recentLeads.length > 0;

  return (
    <div className="rounded-xl p-5 bg-[#0c0c12] border border-white/[0.07] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Discovery Source &amp; Lead Pool
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
              closeBDS Engine
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            closeBDS Discovery Status &amp; Lead Pool Preview
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            closeBDS discovers business prospects. closeVDS researches, qualifies, and prepares them for AI calling.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <Link href="/settings">
            <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer">
              Connection Settings
            </button>
          </Link>
          <Link href="/leads">
            <button className="px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white text-zinc-200 hover:text-black border border-white/[0.12] hover:border-white text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-sm">
              <span>View Lead Pool</span>
              <span className="text-xs">→</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Source Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-[#0e0e16] border border-white/[0.06] rounded-lg space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            closeBDS Status
          </span>
          <p className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            Connected &amp; Standby
          </p>
        </div>

        <div className="p-3 bg-[#0e0e16] border border-white/[0.06] rounded-lg space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Sync Pipeline
          </span>
          <p className="text-xs font-semibold text-zinc-200 truncate">
            Direct Ingestion to Lead Pool
          </p>
        </div>

        <div className="p-3 bg-[#0e0e16] border border-white/[0.06] rounded-lg space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Ingested Prospects
          </span>
          <p className="text-xs font-semibold font-mono text-white">
            {isLoading ? "..." : `${recentLeads.length} Synced Records`}
          </p>
        </div>
      </div>

      {/* Lead Pool Preview Table */}
      <div className="border border-white/[0.07] rounded-lg overflow-hidden bg-[#0a0a0f]">
        <div className="px-4 py-2.5 bg-[#0e0e14] border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
            Recent Prospects in Lead Pool
          </span>
          <Link
            href="/leads"
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Inspect all</span>
            <span className="text-zinc-500">→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500 uppercase tracking-wider font-mono text-[10px] bg-[#0c0c12]">
                <th className="py-2.5 px-4 font-medium">Business &amp; Domain</th>
                <th className="py-2.5 px-4 font-medium">Location</th>
                <th className="py-2.5 px-4 font-medium">Research</th>
                <th className="py-2.5 px-4 font-medium">Qualification</th>
                <th className="py-2.5 px-4 font-medium">Call Readiness</th>
                <th className="py-2.5 px-4 text-right font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-xs text-zinc-500 font-mono">
                    Loading prospect preview...
                  </td>
                </tr>
              ) : !hasLeads ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center">
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <p className="text-xs font-medium text-zinc-300">
                        No prospects currently in Lead Pool
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Connect closeBDS or import your first target accounts in the Leads workspace.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/leads"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-mono text-zinc-200 transition-colors"
                        >
                          <span>Open Lead Pool</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                recentLeads.slice(0, 5).map((lead) => {
                  const isQualified = lead.status === "QUALIFIED";
                  const isContacted = lead.status === "CONTACTED";
                  const score = lead.leadScore?.finalScore;

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4">
                        <Link href="/leads" className="font-semibold text-white hover:underline">
                          {lead.businessName}
                        </Link>
                        {lead.domain && (
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {lead.domain}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-zinc-300 font-mono text-[11px]">
                        {lead.city || lead.country
                          ? `${lead.city || ""}${lead.city && lead.country ? ", " : ""}${lead.country || ""}`
                          : "—"}
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {lead.leadScore ? "Audited" : "Pending"}
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[11px]">
                        {score !== undefined && score !== null ? (
                          <span className={score >= 70 ? "text-emerald-400 font-semibold" : "text-zinc-400"}>
                            {score}/100
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-4">
                        {isQualified ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Call Ready
                          </span>
                        ) : isContacted ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Contacted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            Awaiting Qual
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <Badge
                          size="sm"
                          variant={isQualified ? "success" : "secondary"}
                          className="font-mono text-[9px]"
                        >
                          {lead.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
