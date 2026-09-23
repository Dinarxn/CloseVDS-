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
    <div className="relative rounded-xl p-5 bg-[#09090f]/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-4 backdrop-blur-sm">
      {/* Top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              Discovery Source &amp; Lead Pool
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
              closeBDS Engine
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">
            closeBDS Discovery Status &amp; Lead Pool Preview
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            closeBDS discovers business prospects. closeVDS researches, qualifies, and prepares them for AI calling.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Link href="/settings">
            <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer">
              Connection Settings
            </button>
          </Link>
          <Link href="/leads">
            <button className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black border border-white text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm">
              <span>View Lead Pool</span>
              <span className="text-xs">→</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Source Telemetry Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#0c0c14]/80 border border-white/[0.06] rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
            closeBDS Status
          </span>
          <p className="text-xs font-semibold text-zinc-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            Connected &amp; Standby
          </p>
        </div>

        <div className="p-3.5 bg-[#0c0c14]/80 border border-white/[0.06] rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
            Sync Pipeline
          </span>
          <p className="text-xs font-semibold text-zinc-200 truncate">
            Direct Ingestion to Lead Pool
          </p>
        </div>

        <div className="p-3.5 bg-[#0c0c14]/80 border border-white/[0.06] rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
            Ingested Prospects
          </span>
          <p className="text-xs font-semibold font-mono text-white tabular-nums">
            {isLoading ? "..." : `${recentLeads.length} Synced Records`}
          </p>
        </div>
      </div>

      {/* Lead Pool Preview Table */}
      <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#07070c]">
        <div className="px-4 py-3 bg-[#0c0c14]/90 border-b border-white/[0.07] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
            Recent Prospects in Lead Pool
          </span>
          <Link
            href="/leads"
            className="group/link text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Inspect all</span>
            <span className="text-zinc-500 group-hover/link:text-white group-hover/link:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 uppercase tracking-wider font-mono text-[10px] bg-[#090910]">
                <th className="py-2.5 px-4 font-semibold">Business &amp; Domain</th>
                <th className="py-2.5 px-4 font-semibold">Location</th>
                <th className="py-2.5 px-4 font-semibold">Research</th>
                <th className="py-2.5 px-4 font-semibold">Qualification</th>
                <th className="py-2.5 px-4 font-semibold">Call Readiness</th>
                <th className="py-2.5 px-4 text-right font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] text-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-zinc-400 font-mono">
                    Loading prospect preview...
                  </td>
                </tr>
              ) : !hasLeads ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center">
                    <div className="space-y-2.5 max-w-md mx-auto">
                      <div className="w-10 h-10 mx-auto rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-zinc-200">
                        No prospects in your Lead Pool
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Connect closeBDS or import your first target accounts to begin acquisition.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/leads"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white text-zinc-200 hover:text-black border border-white/[0.10] hover:border-white text-xs font-mono font-medium transition-all shadow-sm"
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
                    <tr key={lead.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <Link href="/leads" className="font-semibold text-white hover:underline">
                          {lead.businessName}
                        </Link>
                        {lead.domain && (
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {lead.domain}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-zinc-300 font-mono text-[11px]">
                        {lead.city || lead.country
                          ? `${lead.city || ""}${lead.city && lead.country ? ", " : ""}${lead.country || ""}`
                          : "—"}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {lead.leadScore ? "Audited" : "Pending"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        {score !== undefined && score !== null ? (
                          <span className={score >= 70 ? "text-emerald-400 font-bold" : "text-zinc-300"}>
                            {score}/100
                          </span>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
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
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                            Awaiting Qual
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
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
