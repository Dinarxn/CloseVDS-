"use client";

import React from "react";
import { Lead } from "@/types/leads";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LeadStatusBadge, QualificationBadge } from "./lead-status-badge";
import { LeadsEmptyState } from "./leads-empty-state";

export interface LeadsCardGridProps {
  leads: Lead[];
  onFindLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onSelectLead?: (lead: Lead) => void;
}

export function LeadsCardGrid({
  leads,
  onFindLeads,
  isFiltered,
  onClearFilters,
  onSelectLead,
}: LeadsCardGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <Card
          key={lead.id}
          variant="standard"
          onClick={() => onSelectLead?.(lead)}
          className="cursor-pointer hover:border-white transition-colors"
        >
          <CardHeader className="mb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm">{lead.companyName}</CardTitle>
              <LeadStatusBadge status={lead.status} />
            </div>
            {lead.industry && (
              <CardDescription className="text-[11px]">{lead.industry}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs border-t border-[#404040]/40">
            <div className="space-y-1">
              <div className="text-[#d4d4d4] font-medium">{lead.contactName || "No contact named"}</div>
              {lead.contactTitle && <div className="text-[11px] text-[#737373]">{lead.contactTitle}</div>}
              {lead.city && <div className="text-[11px] text-[#737373]">{lead.city}</div>}
            </div>

            <div className="flex items-center justify-between pt-1">
              <QualificationBadge
                qualification={lead.qualification?.qualificationStatus}
                score={lead.qualification?.totalScore}
              />
              <span className="text-[10px] text-[#737373] uppercase tracking-wider capitalize">
                {lead.source.replace("_", " ")}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
