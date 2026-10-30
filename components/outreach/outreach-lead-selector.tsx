"use client";

import React from "react";
import { Lead } from "@/types/leads";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface OutreachLeadSelectorProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
  isLoading?: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  page: number;
  totalPages: number;
  totalLeads: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function OutreachLeadSelector({
  leads,
  selectedLeadId,
  onSelectLead,
  isLoading = false,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  totalLeads,
  onPrevPage,
  onNextPage,
}: OutreachLeadSelectorProps) {
  return (
    <div className="relative flex flex-col h-full bg-surface-card border border-white/[0.08] rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
      {/* Specular hairline top reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Filter Bar */}
      <div className="p-3.5 bg-surface-panel/90 border-b border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D39EB] shrink-0" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Target Leads Directory
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
            {totalLeads} in workspace
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search company, city, contact..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8.5 text-xs bg-surface-card border-white/[0.08] text-white placeholder:text-zinc-500 rounded-lg focus:border-violet-500/50"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-white text-xs cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-8.5 px-2.5 text-xs bg-surface-elevated border border-white/[0.10] text-zinc-200 rounded-lg focus:outline-none focus:border-violet-500/50 cursor-pointer font-sans"
            aria-label="Filter leads by status"
          >
            <option value="">All Statuses</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CALL_READY">Call Ready</option>
            <option value="CONTACTED">Contacted</option>
            <option value="IN_FOLLOWUP">In Follow-up</option>
            <option value="DISCOVERED">Discovered</option>
            <option value="OPT_OUT">Opted Out (Suppressed)</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] min-h-[360px] max-h-[560px]">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">Loading leads from workspace...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center space-y-2 font-mono">
            <p className="text-xs font-medium text-zinc-300">No leads match your filter</p>
            <p className="text-[11px] text-zinc-500 font-sans">
              Try adjusting your search terms or clearing the status filter.
            </p>
          </div>
        ) : (
          leads.map((lead) => {
            const isSelected = lead.id === selectedLeadId;
            const isOptedOut = lead.status === "opted_out";
            const hasEmail = Boolean(lead.email);
            const hasPhone = Boolean(lead.phone);
            const score = lead.qualification?.totalScore;

            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => onSelectLead(lead)}
                className={`w-full text-left p-3.5 transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-violet-950/20 border-l-2 border-l-[#7D39EB]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white truncate block tracking-tight">
                      {lead.companyName}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate block mt-0.5 font-sans">
                      {lead.contactName ? `${lead.contactName} · ` : ""}
                      {lead.city || "Area unlisted"}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>

                {/* Channel Availabilities & Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {isOptedOut ? (
                    <Badge variant="danger" size="sm" className="font-mono text-[10px]">
                      Suppressed (Opt-Out)
                    </Badge>
                  ) : (
                    <>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          hasEmail
                            ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/25"
                            : "bg-surface-panel text-zinc-500 border-white/[0.05]"
                        }`}
                        title={hasEmail ? `Email: ${lead.email}` : "No email available"}
                      >
                        {hasEmail ? "Email ✓" : "No Email"}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          hasPhone
                            ? "bg-violet-500/10 text-violet-300 border-violet-500/25"
                            : "bg-surface-panel text-zinc-500 border-white/[0.05]"
                        }`}
                        title={hasPhone ? `Phone: ${lead.phone}` : "No phone available"}
                      >
                        {hasPhone ? "Phone ✓" : "No Phone"}
                      </span>

                      {score !== undefined && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border tabular-nums ${
                          score >= 70
                            ? "bg-lime-500/15 text-[#C6FF33] border-lime-500/35 font-bold"
                            : "bg-surface-panel text-zinc-400 border-white/[0.06]"
                        }`}>
                          {score} pts
                        </span>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-surface-panel/90 border-t border-white/[0.08] flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={page <= 1 || isLoading}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-white/[0.10] text-zinc-300 hover:text-white bg-surface-card hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={page >= totalPages || isLoading}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-white/[0.10] text-zinc-300 hover:text-white bg-surface-card hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
