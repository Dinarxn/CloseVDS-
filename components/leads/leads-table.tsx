"use client";

import React from "react";
import { Lead } from "@/types/leads";
import { LeadStatusBadge, QualificationBadge } from "./lead-status-badge";
import { LeadsEmptyState } from "./leads-empty-state";

export interface LeadsTableProps {
  leads: Lead[];
  onFindLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onSelectLead?: (lead: Lead) => void;
  onPrepareCall?: (lead: Lead) => void;
}

export function LeadsTable({
  leads,
  onFindLeads,
  isFiltered,
  onClearFilters,
  onSelectLead,
  onPrepareCall,
}: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <LeadsEmptyState
        onFindLeads={onFindLeads}
        isFiltered={isFiltered}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="relative border border-white/[0.08] rounded-xl overflow-hidden bg-[#09090f]/95 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm">
      {/* Top specular hairline highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#0c0c14]/90 text-zinc-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
              <th className="py-2.5 px-3.5">Company &amp; Domain</th>
              <th className="py-2.5 px-3.5">Contact</th>
              <th className="py-2.5 px-3.5">Location &amp; Industry</th>
              <th className="py-2.5 px-3.5">AI Qualification</th>
              <th className="py-2.5 px-3.5">Status</th>
              <th className="py-2.5 px-3.5">Source</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-zinc-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead?.(lead)}
                className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-3.5 font-medium text-white">
                  <div className="font-semibold text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                    {lead.companyName}
                  </div>
                  {lead.website && (
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {lead.website}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-zinc-300">
                  <div className="text-zinc-200 text-xs font-medium">
                    {lead.contactName || "—"}
                  </div>
                  {lead.contactTitle && (
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {lead.contactTitle}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-zinc-300">
                  <div className="text-[11px] text-zinc-200">
                    {lead.city || lead.address || "—"}
                  </div>
                  {lead.industry && (
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {lead.industry}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3.5">
                  <QualificationBadge
                    qualification={lead.qualification?.qualificationStatus}
                    score={lead.qualification?.totalScore}
                  />
                </td>
                <td className="py-2.5 px-3.5">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="py-2.5 px-3.5 text-zinc-400 font-mono text-[10px] uppercase tracking-wider">
                  {lead.source.replace("_", " ")}
                </td>
                <td className="py-2.5 px-3.5 text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {onPrepareCall && (
                      <button
                        onClick={() => onPrepareCall(lead)}
                        className="text-xs font-sans font-medium px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white text-zinc-300 hover:text-black border border-white/[0.10] hover:border-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Prepare AI Voice Call"
                      >
                        <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>AI Call</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectLead?.(lead)}
                      className="text-xs font-sans font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect</span>
                      <span className="text-zinc-500">→</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
