"use client";

import React, { useState, useEffect } from "react";
import { Lead, LeadStatus } from "@/types/leads";
import { LeadStatusSelect } from "./lead-status-select";
import { QualificationBadge } from "./lead-status-badge";
import { LeadContactActions } from "./lead-contact-actions";
import { mapLeadStatusToBackendStatus } from "@/lib/mappers";
import { api, ApiClientError } from "@/lib/api-client";

export interface PipelineStageConfig {
  id: string;
  label: string;
  description: string;
  statuses: LeadStatus[];
  nextStatus?: LeadStatus;
  accentBadge: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: "discovery",
    label: "Discovery",
    description: "Ingested candidates awaiting research or audit",
    statuses: ["discovered", "analyzing"],
    accentBadge: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },
  {
    id: "qualified",
    label: "Qualified",
    description: "Audited & scored above qualification threshold",
    statuses: ["qualified"],
    nextStatus: "outreach_ready",
    accentBadge: "bg-[#C6FF33]/10 text-[#C6FF33] border-[#C6FF33]/30",
  },
  {
    id: "call_ready",
    label: "Call Ready",
    description: "Operator approved and queued for calling",
    statuses: ["outreach_ready"],
    nextStatus: "contacted",
    accentBadge: "bg-[#7D39EB]/15 text-[#B78AF7] border-[#7D39EB]/35",
  },
  {
    id: "contacted",
    label: "Contacted",
    description: "Outbound call or touch dispatched",
    statuses: ["contacted"],
    nextStatus: "in_followup",
    accentBadge: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  },
  {
    id: "followup_replied",
    label: "In Follow-up / Replied",
    description: "Prospect engaged or awaiting follow-up call",
    statuses: ["in_followup", "replied"],
    nextStatus: "meeting_booked",
    accentBadge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  {
    id: "meeting_booked",
    label: "Meeting Booked",
    description: "Positive acquisition outcome scheduled",
    statuses: ["meeting_booked"],
    nextStatus: "closed_won",
    accentBadge: "bg-[#C6FF33]/12 text-[#C6FF33] border-[#C6FF33]/35",
  },
  {
    id: "closed",
    label: "Closed / Terminal",
    description: "Won deals, lost, disqualified, or opted out",
    statuses: ["closed_won", "closed_lost", "disqualified", "opted_out"],
    accentBadge: "bg-white/[0.04] text-[#8E8E9F] border-white/[0.08]",
  },
];

export interface LeadsPipelineViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onLeadStatusChanged?: (leadId: string, newStatus: LeadStatus) => void;
  page: number;
  totalPages: number;
  total: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  isLoading?: boolean;
}

export function LeadsPipelineView({
  leads,
  onSelectLead,
  onLeadStatusChanged,
  page,
  totalPages,
  total,
  onPreviousPage,
  onNextPage,
  isLoading = false,
}: LeadsPipelineViewProps) {
  const [advancingLeadId, setAdvancingLeadId] = useState<string | null>(null);
  const [stageError, setStageError] = useState<{ leadId: string; message: string } | null>(null);

  // Auto-dismiss stage error after 8 seconds
  useEffect(() => {
    if (!stageError) return;
    const timer = setTimeout(() => {
      setStageError(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [stageError]);

  const handleQuickAdvance = async (e: React.MouseEvent, lead: Lead, targetStatus: LeadStatus) => {
    e.stopPropagation();
    if (advancingLeadId) return;

    setAdvancingLeadId(lead.id);
    setStageError(null);

    try {
      const backendStatus = mapLeadStatusToBackendStatus(targetStatus);
      await api.crm.updateStage(lead.id, {
        status: backendStatus,
      });

      onLeadStatusChanged?.(lead.id, targetStatus);
    } catch (err: unknown) {
      let msg = "Failed to advance stage.";
      if (err instanceof ApiClientError) {
        msg = err.message || `Stage transition rejected (HTTP ${err.statusCode}).`;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setStageError({ leadId: lead.id, message: msg });
    } finally {
      setAdvancingLeadId(null);
    }
  };

  const leadsCount = leads.length;

  return (
    <div className="space-y-3.5">
      {/* Scope & Pagination Context Surface */}
      <div className="relative p-2.5 sm:p-3 bg-[#0A0A0E] border border-white/[0.08] rounded-xl shadow-xs backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#C6FF33] shadow-[0_0_8px_#C6FF33] shrink-0" />
          <span className="font-mono text-[#8E8E9F]">
            Pipeline Scope: <span className="text-white font-medium tabular-nums">{leadsCount} leads</span> loaded on page{" "}
            <span className="text-white font-medium tabular-nums">{page}</span> of{" "}
            <span className="text-white font-medium tabular-nums">{totalPages}</span>{" "}
            {total > 0 && <span className="text-[#565668] font-mono">(<span className="tabular-nums">{total}</span> total in workspace)</span>}
          </span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={page <= 1 || isLoading}
              className="h-7 px-2.5 rounded-lg border text-xs font-medium font-sans flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/[0.03] hover:bg-[#7D39EB]/20 text-[#CBCBD6] hover:text-white border-white/[0.08] hover:border-[#7D39EB]/40"
            >
              <span>←</span>
              <span>Prev Page</span>
            </button>
            <span className="text-[11px] font-mono text-[#8E8E9F] tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={onNextPage}
              disabled={page >= totalPages || isLoading}
              className="h-7 px-2.5 rounded-lg border text-xs font-medium font-sans flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/[0.03] hover:bg-[#7D39EB]/20 text-[#CBCBD6] hover:text-white border-white/[0.08] hover:border-[#7D39EB]/40"
            >
              <span>Next Page</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Transition Error Banner */}
      {stageError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start justify-between gap-3 shadow-md backdrop-blur-sm"
        >
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="font-semibold block font-mono text-[11px] uppercase">
                Stage Transition Rejected by Server
              </span>
              <p className="text-rose-200/90 leading-relaxed font-sans">{stageError.message}</p>
            </div>
          </div>
          <button
            onClick={() => setStageError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs p-1 cursor-pointer"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Horizontal Kanban Columns */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex items-start space-x-3.5 min-w-[1700px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => stage.statuses.includes(l.status));

            return (
              <div
                key={stage.id}
                className="flex-1 min-w-[270px] max-w-[320px] bg-[#0A0A0E] border border-white/[0.08] rounded-xl flex flex-col max-h-[780px] shadow-xs relative overflow-hidden"
              >
                {/* Specular hairline */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

                {/* Column Header */}
                <div className="p-3.5 border-b border-white/[0.08] bg-[#111116]/95 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      {stage.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                        stageLeads.length > 0
                          ? "bg-[#7D39EB]/15 text-[#B78AF7] border-[#7D39EB]/35 font-bold"
                          : "bg-white/[0.02] text-[#8E8E9F] border-white/[0.06]"
                      }`}
                    >
                      {stageLeads.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8E8E9F] line-clamp-1 leading-snug">
                    {stage.description}
                  </p>
                </div>

                {/* Column Body / Cards List */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-white/[0.06] rounded-lg bg-white/[0.01] space-y-1 px-3">
                      <span className="text-[11px] font-mono text-[#8E8E9F] block font-medium">
                        No prospects in stage
                      </span>
                      <span className="text-[10px] text-[#565668] block leading-tight">
                        {stage.description}
                      </span>
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const isAdvancing = advancingLeadId === lead.id;

                      return (
                        <div
                          key={lead.id}
                          onClick={() => onSelectLead(lead)}
                          className="group relative p-3 bg-[#111116] hover:bg-[#171720] border border-white/[0.08] hover:border-[#7D39EB]/40 rounded-lg transition-all cursor-pointer space-y-2 text-xs shadow-xs"
                        >
                          {/* Card Header: Business name & Status Selector */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-white tracking-tight truncate group-hover:text-white transition-colors">
                                {lead.companyName}
                              </h5>
                              {lead.website ? (
                                <p className="text-[10px] font-mono text-[#8E8E9F] truncate mt-0.5">
                                  {lead.website}
                                </p>
                              ) : lead.city ? (
                                <p className="text-[10px] text-[#8E8E9F] truncate mt-0.5">
                                  {lead.city}
                                </p>
                              ) : null}
                            </div>

                            {/* Dropdown status selector directly on pipeline card */}
                            <div className="shrink-0">
                              <LeadStatusSelect
                                leadId={lead.id}
                                currentStatus={lead.status}
                                size="sm"
                                onStatusChange={(newStatus) => onLeadStatusChanged?.(lead.id, newStatus)}
                              />
                            </div>
                          </div>

                          {/* Contact Details & Direct Contact Actions */}
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/[0.04]">
                            <div className="min-w-0 text-[11px]">
                              {lead.contactName ? (
                                <div className="text-white font-medium truncate">
                                  {lead.contactName}
                                </div>
                              ) : (
                                <div className="text-[#565668] italic text-[10px]">No contact named</div>
                              )}
                              {lead.phone && (
                                <div className="text-[#8E8E9F] font-mono text-[10px] truncate">
                                  {lead.phone}
                                </div>
                              )}
                            </div>

                            <LeadContactActions
                              phone={lead.phone}
                              email={lead.email}
                              companyName={lead.companyName}
                              size="sm"
                              className="shrink-0"
                            />
                          </div>

                          {/* Footer with Qualification & Quick Advance Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                            <div className="shrink-0">
                              <QualificationBadge
                                qualification={lead.qualification?.qualificationStatus}
                                score={lead.qualification?.totalScore}
                              />
                            </div>

                            {stage.nextStatus && (
                              <button
                                type="button"
                                disabled={isAdvancing}
                                onClick={(e) => handleQuickAdvance(e, lead, stage.nextStatus!)}
                                title={`Advance stage to ${stage.nextStatus}`}
                                className="h-6 px-2 rounded text-[10px] font-mono uppercase tracking-wider bg-white/[0.04] hover:bg-[#7D39EB]/20 text-[#CBCBD6] hover:text-white border border-white/[0.08] hover:border-[#7D39EB]/40 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {isAdvancing ? (
                                  <span className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <span>Advance</span>
                                    <span>→</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
