"use client";

import React from "react";
import { Lead } from "@/types/leads";
import {
  ActionabilityBadge,
  DataQualityBadge,
  LeadStatusBadge,
  MapsMatchStatusBadge,
  QualificationBadge,
  ServiceRecommendationBadge,
} from "./lead-status-badge";
import { LeadsEmptyState } from "./leads-empty-state";

export interface LeadsCardGridProps {
  leads: Lead[];
  onFindLeads?: () => void;
  onImportLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onSelectLead?: (lead: Lead) => void;
}

export function LeadsCardGrid({
  leads,
  onFindLeads,
  onImportLeads,
  isFiltered,
  onClearFilters,
  onSelectLead,
}: LeadsCardGridProps) {
  if (leads.length === 0) {
    return (
      <LeadsEmptyState
        onFindLeads={onFindLeads}
        onImportLeads={onImportLeads}
        isFiltered={isFiltered}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          onClick={() => onSelectLead?.(lead)}
          className="group relative p-3.5 sm:p-4 bg-[#0a0a0f] hover:bg-[#0e0e14] border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-3 hover:shadow-xs backdrop-blur-sm"
        >
          {/* Top hairline specular highlight on hover */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Card Header */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-zinc-100 transition-colors">
                {lead.companyName}
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {lead.dataQuality && <DataQualityBadge quality={lead.dataQuality} />}
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>
            {lead.website ? (
              <p className="text-[11px] font-mono text-zinc-400 truncate">
                {lead.website}
              </p>
            ) : lead.industry ? (
              <p className="text-[11px] text-zinc-500 truncate">
                {lead.industry}
              </p>
            ) : null}
          </div>

          {/* Card Content */}
          <div className="space-y-0.5 pt-2.5 border-t border-white/[0.06] text-xs">
            <div className="text-zinc-200 font-medium text-xs">
              {lead.contactName || "No contact named"}
            </div>
            {lead.contactTitle && (
              <div className="text-[11px] text-zinc-400">
                {lead.contactTitle}
              </div>
            )}
            {lead.city && (
              <div className="text-[11px] text-zinc-400">
                {lead.city}
              </div>
            )}
          </div>

          {/* Actionability & Channel Eligibility (if present) */}
          {lead.actionability && (
            <div className="pt-2 border-t border-white/[0.06]">
              <ActionabilityBadge actionability={lead.actionability} />
            </div>
          )}

          {/* Service Opportunity Recommendation */}
          <div className="pt-2 border-t border-white/[0.06]">
            <ServiceRecommendationBadge
              recommendation={lead.serviceRecommendation}
              compact
            />
          </div>

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <QualificationBadge
                qualification={lead.qualification?.qualificationStatus}
                score={lead.qualification?.totalScore}
              />
              {lead.mapsMatchStatus && (
                <MapsMatchStatusBadge status={lead.mapsMatchStatus} />
              )}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              {lead.source.replace("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
