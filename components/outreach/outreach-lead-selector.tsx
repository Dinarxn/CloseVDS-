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
    <div className="flex flex-col h-full bg-[#0a0a0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-xs">
      {/* Top Filter Bar */}
      <div className="p-3 bg-[#0f0f14] border-b border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Target Leads
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            {totalLeads} in workspace
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search by company, city, contact..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8 text-xs bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-lg focus:border-white/30"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-2 text-zinc-400 hover:text-white text-xs"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-8 px-2 text-xs bg-[#121218] border border-white/[0.1] text-zinc-200 rounded-lg focus:outline-none focus:border-white/30 cursor-pointer font-sans"
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
            <div className="w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">Loading leads from workspace...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-medium text-zinc-300">No leads match your filter</p>
            <p className="text-[11px] text-zinc-500">
              Try adjusting your search terms or clearing the status filter.
            </p>
          </div>
        ) : (
          leads.map((lead) => {
            const isSelected = lead.id === selectedLeadId;
            const isOptedOut = lead.status === "opted_out";
            const hasEmail = Boolean(lead.email);
            const hasPhone = Boolean(lead.phone);

            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => onSelectLead(lead)}
                className={`w-full text-left p-3 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-white/[0.08] border-l-2 border-l-white"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white truncate block">
                      {lead.companyName}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate block">
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
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-rose-500/40 text-rose-300 bg-rose-950/20">
                      Suppressed (Opt-Out)
                    </Badge>
                  ) : (
                    <>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0 rounded border ${
                          hasEmail
                            ? "bg-emerald-950/30 text-emerald-300 border-emerald-500/30"
                            : "bg-zinc-900 text-zinc-500 border-white/[0.05]"
                        }`}
                        title={hasEmail ? `Email: ${lead.email}` : "No email available"}
                      >
                        {hasEmail ? "Email ✓" : "No Email"}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-1.5 py-0 rounded border ${
                          hasPhone
                            ? "bg-sky-950/30 text-sky-300 border-sky-500/30"
                            : "bg-zinc-900 text-zinc-500 border-white/[0.05]"
                        }`}
                        title={hasPhone ? `Phone: ${lead.phone}` : "No phone available"}
                      >
                        {hasPhone ? "Phone ✓" : "No Phone"}
                      </span>

                      {lead.qualification?.totalScore !== undefined && (
                        <span className="text-[10px] font-mono px-1 py-0 text-zinc-400">
                          {lead.qualification.totalScore} pts
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
      <div className="p-2.5 bg-[#0f0f14] border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-[11px] font-mono text-zinc-400">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={page <= 1 || isLoading}
            className="px-2 py-0.5 rounded text-[11px] font-medium border border-white/[0.08] text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={page >= totalPages || isLoading}
            className="px-2 py-0.5 rounded text-[11px] font-medium border border-white/[0.08] text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
