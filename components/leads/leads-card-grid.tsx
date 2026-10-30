"use client";

import React from "react";
import { Lead, LeadStatus } from "@/types/leads";
import {
  ActionabilityBadge,
  DataQualityBadge,
  MapsMatchStatusBadge,
  QualificationBadge,
  ServiceRecommendationBadge,
} from "./lead-status-badge";
import { LeadStatusSelect } from "./lead-status-select";
import { LeadContactActions } from "./lead-contact-actions";
import { LeadsEmptyState } from "./leads-empty-state";

export interface LeadsCardGridProps {
  leads: Lead[];
  onFindLeads?: () => void;
  onImportLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onSelectLead?: (lead: Lead) => void;
  onLeadStatusChanged?: (leadId: string, newStatus: LeadStatus) => void;
}

export function LeadsCardGrid({
  leads,
  onFindLeads,
  onImportLeads,
  isFiltered,
  onClearFilters,
  onSelectLead,
  onLeadStatusChanged,
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
          className="group relative p-3.5 sm:p-4 bg-[#111116] hover:bg-[#171720] border border-white/[0.08] hover:border-[#7D39EB]/40 rounded-xl transition-all duration-150 cursor-pointer flex flex-col justify-between space-y-3 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-sm"
        >
          {/* Top hairline specular highlight on hover */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Card Header */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-white transition-colors">
                {lead.companyName}
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {lead.dataQuality && <DataQualityBadge quality={lead.dataQuality} />}
                <LeadStatusSelect
                  leadId={lead.id}
                  currentStatus={lead.status}
                  size="sm"
                  onStatusChange={(newStatus) => onLeadStatusChanged?.(lead.id, newStatus)}
                />
              </div>
            </div>
            {lead.website ? (
              <p className="text-[11px] font-mono text-[#8E8E9F] truncate">
                {lead.website}
              </p>
            ) : lead.industry ? (
              <p className="text-[11px] text-[#8E8E9F] truncate">
                {lead.industry}
              </p>
            ) : null}
          </div>

          {/* Card Content & Contact Info */}
          <div className="space-y-2 pt-2.5 border-t border-white/[0.06] text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-white font-medium text-xs truncate">
                  {lead.contactName || "No contact named"}
                </div>
                {lead.contactTitle && (
                  <div className="text-[11px] text-[#8E8E9F] truncate">
                    {lead.contactTitle}
                  </div>
                )}
                {lead.city && (
                  <div className="text-[11px] text-[#8E8E9F]">
                    {lead.city}
                  </div>
                )}
              </div>

              {/* Direct Contact Actions in Card */}
              <LeadContactActions
                phone={lead.phone}
                email={lead.email}
                companyName={lead.companyName}
                size="sm"
                className="shrink-0"
              />
            </div>
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
            <span className="text-[10px] font-mono text-[#8E8E9F] uppercase tracking-wider">
              {lead.source.replace("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
