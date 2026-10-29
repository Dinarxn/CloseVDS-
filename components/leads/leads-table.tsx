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
      <div className="relative border border-white/[0.06] rounded-xl overflow-hidden bg-[#0a0a0f] shadow-xs backdrop-blur-sm">
        {/* Top specular hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0c0c12]/95 text-zinc-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Company &amp; Domain</th>
                <th className="py-3 px-3.5">Contact</th>
                <th className="py-3 px-3.5">Location &amp; Industry</th>
                <th className="py-3 px-3.5 whitespace-nowrap">AI Qualification</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Service Opportunity</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status &amp; Actionability</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-200">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead?.(lead)}
                  className="group hover:bg-white/[0.025] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-100 text-xs sm:text-[13px] tracking-tight leading-snug group-hover:text-white transition-colors">
                      {lead.companyName}
                    </div>
                    {lead.website && (
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate max-w-[210px] block hover:text-zinc-300 transition-colors">
                        {lead.website}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-zinc-300">
                    {lead.contactName ? (
                      <div className="text-zinc-200 text-xs font-medium">
                        {lead.contactName}
                      </div>
                    ) : (
                      <span className="text-zinc-600 font-mono text-xs">—</span>
                    )}
                    {lead.contactTitle && (
                      <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[150px]">
                        {lead.contactTitle}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-zinc-300">
                    <div className="text-[11px] text-zinc-300 font-normal leading-tight">
                      {lead.city || lead.address || <span className="text-zinc-600 font-mono text-xs">—</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {lead.industry && (
                        <span className="text-[11px] text-zinc-500 leading-tight">
                          {lead.industry}
                        </span>
                      )}
                      {lead.mapsMatchStatus && (
                        <MapsMatchStatusBadge status={lead.mapsMatchStatus} />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <QualificationBadge
                      qualification={lead.qualification?.qualificationStatus}
                      score={lead.qualification?.totalScore}
                    />
                  </td>
                  <td className="py-3 px-3.5">
                    <ServiceRecommendationBadge
                      recommendation={lead.serviceRecommendation}
                    />
                  </td>
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
                  <td className="py-3 px-3.5 text-zinc-400 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap">
                    {lead.source.replace("_", " ")}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onPrepareCall && (
                        <button
                          onClick={() => onPrepareCall(lead)}
                          className="h-7 px-2.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] hover:border-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Prepare AI Voice Call"
                        >
                          <svg className="w-3 h-3 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>AI Call</span>
                        </button>
                      )}
                      <button
                        onClick={() => onSelectLead?.(lead)}
                        className="h-7 px-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Inspect</span>
                        <span className="text-zinc-500">→</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadToDelete(lead)}
                        className="h-7 w-7 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors flex items-center justify-center cursor-pointer"
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
