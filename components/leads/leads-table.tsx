"use client";

import React, { useState } from "react";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/lib/api-client";

export interface LeadsTableProps {
  leads: Lead[];
  onFindLeads?: () => void;
  onImportLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onSelectLead?: (lead: Lead) => void;
  onPrepareCall?: (lead: Lead) => void;
  onLeadStatusChanged?: (leadId: string, newStatus: LeadStatus) => void;
  onLeadDeleted?: () => void;
}

export function LeadsTable({
  leads,
  onFindLeads,
  onImportLeads,
  isFiltered,
  onClearFilters,
  onSelectLead,
  onPrepareCall,
  onLeadStatusChanged,
  onLeadDeleted,
}: LeadsTableProps) {
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();

  const handleConfirmDelete = async () => {
    if (!leadToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.leads.delete(leadToDelete.id);
      addToast({
        title: "Lead permanently deleted",
        description: `"${leadToDelete.companyName}" was deleted from the workspace.`,
        variant: "success",
      });
      setLeadToDelete(null);
      onLeadDeleted?.();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to delete lead from workspace.";
      addToast({
        title: "Deletion failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
    <>
      <div className="relative border border-white/[0.08] rounded-xl overflow-hidden bg-[#111116] shadow-xs backdrop-blur-sm">
        {/* Top specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#0A0A0E]/95 text-[#8E8E9F] text-[10px] font-mono uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Company &amp; Domain</th>
                <th className="py-3 px-3.5">Contact Details &amp; Direct Actions</th>
                <th className="py-3 px-3.5">Location &amp; Industry</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Qualification Score</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Opportunity Recommendation</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-[#CBCBD6]">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead?.(lead)}
                  className="group hover:bg-[#7D39EB]/[0.05] transition-colors duration-150 cursor-pointer"
                >
                  {/* 1. Company & Domain */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white text-xs sm:text-[13px] tracking-tight leading-snug group-hover:text-white transition-colors">
                      {lead.companyName}
                    </div>
                    {lead.website ? (
                      <div className="text-[11px] font-mono text-[#8E8E9F] mt-0.5 truncate max-w-[210px] block hover:text-[#CBCBD6] transition-colors">
                        {lead.website}
                      </div>
                    ) : (
                      <span className="text-[#565668] font-mono text-[10px] block mt-0.5">No domain</span>
                    )}
                  </td>

                  {/* 2. Contact Details & Direct Actions (WhatsApp, Email, Call) */}
                  <td className="py-3 px-3.5 text-[#CBCBD6]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 pr-1">
                        {lead.contactName ? (
                          <div className="text-white text-xs font-medium truncate max-w-[130px]">
                            {lead.contactName}
                          </div>
                        ) : (
                          <span className="text-[#565668] font-mono text-xs">No contact named</span>
                        )}
                        {lead.contactTitle && (
                          <div className="text-[11px] text-[#8E8E9F] mt-0.5 truncate max-w-[130px]">
                            {lead.contactTitle}
                          </div>
                        )}
                      </div>

                      {/* Direct Contact Actions Cluster: WhatsApp, Email, Direct Dial Call */}
                      <LeadContactActions
                        phone={lead.phone}
                        email={lead.email}
                        companyName={lead.companyName}
                        size="sm"
                        className="shrink-0"
                      />
                    </div>
                  </td>

                  {/* 3. Location & Industry */}
                  <td className="py-3 px-3.5 text-[#CBCBD6]">
                    <div className="text-[11px] text-[#CBCBD6] font-normal leading-tight">
                      {lead.city || lead.address || <span className="text-[#565668] font-mono text-xs">—</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {lead.industry && (
                        <span className="text-[11px] text-[#8E8E9F] leading-tight">
                          {lead.industry}
                        </span>
                      )}
                      {lead.mapsMatchStatus && (
                        <MapsMatchStatusBadge status={lead.mapsMatchStatus} />
                      )}
                    </div>
                  </td>

                  {/* 4. Qualification Score */}
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <QualificationBadge
                      qualification={lead.qualification?.qualificationStatus}
                      score={lead.qualification?.totalScore}
                    />
                  </td>

                  {/* 5. Opportunity Recommendation */}
                  <td className="py-3 px-3.5">
                    <ServiceRecommendationBadge
                      recommendation={lead.serviceRecommendation}
                    />
                  </td>

                  {/* 6. Status Selector */}
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <LeadStatusSelect
                          leadId={lead.id}
                          currentStatus={lead.status}
                          size="sm"
                          onStatusChange={(newStatus) => onLeadStatusChanged?.(lead.id, newStatus)}
                        />
                        {lead.dataQuality && <DataQualityBadge quality={lead.dataQuality} />}
                      </div>
                      {lead.actionability && (
                        <ActionabilityBadge actionability={lead.actionability} />
                      )}
                    </div>
                  </td>

                  {/* 7. Source */}
                  <td className="py-3 px-3.5 text-[#8E8E9F] font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">
                    {lead.source.replace("_", " ")}
                  </td>

                  {/* 8. Actions (AI Call, Inspect, Permanent Delete) */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onPrepareCall && (
                        <button
                          onClick={() => onPrepareCall(lead)}
                          className="h-7 px-2.5 rounded-lg bg-[#7D39EB]/15 hover:bg-[#7D39EB]/25 text-[#CBCBD6] hover:text-white border border-[#7D39EB]/35 hover:border-[#7D39EB]/60 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Prepare AI Voice Call"
                        >
                          <svg className="w-3 h-3 text-[#A879F5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>AI Call</span>
                        </button>
                      )}
                      <button
                        onClick={() => onSelectLead?.(lead)}
                        className="h-7 px-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-xs font-medium text-[#CBCBD6] hover:text-white border border-white/[0.06] hover:border-white/[0.14] transition-all flex items-center gap-1 cursor-pointer"
                        title="Inspect Lead Dossier"
                      >
                        <span>Inspect</span>
                        <span className="text-[#8E8E9F]">→</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadToDelete(lead)}
                        className="h-7 w-7 rounded-lg text-[#8E8E9F] hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors flex items-center justify-center cursor-pointer"
                        title="Permanently Delete Lead"
                        aria-label={`Permanently delete ${lead.companyName}`}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(leadToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setLeadToDelete(null);
        }}
        title="Permanently Delete Lead"
        description={`Are you sure you want to delete "${leadToDelete?.companyName || "this lead"}"? This action cannot be undone. All associated contacts, CRM activities, website audits, and outreach history will be permanently deleted from the workspace.`}
        confirmLabel="Permanently Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
