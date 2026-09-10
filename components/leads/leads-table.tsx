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
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#121216] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#0d0d12] text-zinc-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Location &amp; Industry</th>
              <th className="py-3 px-4">Qualification</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-zinc-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead?.(lead)}
                className="hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 font-medium text-white">
                  <div>{lead.companyName}</div>
                  {lead.website && <div className="text-[11px] text-zinc-500">{lead.website}</div>}
                </td>
                <td className="py-3 px-4 text-zinc-300">
                  <div>{lead.contactName || "—"}</div>
                  {lead.contactTitle && <div className="text-[11px] text-zinc-500">{lead.contactTitle}</div>}
                </td>
                <td className="py-3 px-4 text-zinc-300">
                  <div>{lead.city || lead.address || "—"}</div>
                  {lead.industry && <div className="text-[11px] text-zinc-500">{lead.industry}</div>}
                </td>
                <td className="py-3 px-4">
                  <QualificationBadge
                    qualification={lead.qualification?.qualificationStatus}
                    score={lead.qualification?.totalScore}
                  />
                </td>
                <td className="py-3 px-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="py-3 px-4 text-zinc-400 capitalize">
                  {lead.source.replace("_", " ")}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {onPrepareCall && (
                      <button
                        onClick={() => onPrepareCall(lead)}
                        className="text-xs px-2.5 py-1 rounded-md bg-[#161622] border border-white/[0.12] hover:border-white/30 text-white transition-colors flex items-center gap-1"
                        title="Prepare AI Voice Call"
                      >
                        <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>AI Call</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectLead?.(lead)}
                      className="text-xs text-zinc-400 hover:text-white underline transition-colors"
                    >
                      View
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
