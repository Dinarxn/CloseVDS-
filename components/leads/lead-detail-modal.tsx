"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadStatusSelect } from "./lead-status-select";
import { api, ApiClientError } from "@/lib/api-client";
import {
  type BackendLead,
  type BackendContact,
  mapBackendStatusToLeadStatus,
  mapLeadStatusToBackendStatus,
} from "@/lib/mappers";
import type { LeadAiWorkflowResult } from "@/types/leads";
import type { CRMActivity } from "@/types/crm";

export interface LeadDetailModalProps {
  isOpen: boolean;
  leadId: string | null;
  onClose: () => void;
  onLeadUpdated?: () => void;
}

function getSafeWebsiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function LeadDetailModal({
  isOpen,
  leadId,
  onClose,
  onLeadUpdated,
}: LeadDetailModalProps) {
  const [lead, setLead] = useState<BackendLead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField((curr) => (curr === field ? null : curr));
    }, 2000);
  };

  const [isExecutingAi, setIsExecutingAi] = useState(false);
  const [aiResult, setAiResult] = useState<LeadAiWorkflowResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [approvalNotes, setApprovalNotes] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // CRM Activities & Notes Timeline
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const fetchLeadDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setLoadError(null);
    setAiResult(null);
    setAiError(null);
    setApprovalNotes("");
    setIsSubmittingApproval(false);
    setApprovalError(null);
    setNoteError(null);
    setNewNote("");

    try {
      // Concurrently retrieve lead record and CRM profile/activities from backend
      const [leadRes, crmRes] = await Promise.allSettled([
        api.leads.get(id),
        api.crm.getProfile(id),
      ]);

      if (leadRes.status === "fulfilled" && leadRes.value?.lead) {
        setLead(leadRes.value.lead);
      } else if (crmRes.status === "fulfilled" && crmRes.value?.lead) {
        setLead(crmRes.value.lead);
      } else {
        setLoadError("Lead not found or access denied for this workspace.");
      }

      if (crmRes.status === "fulfilled" && Array.isArray(crmRes.value?.activities)) {
        setActivities(crmRes.value.activities);
      } else {
        setActivities([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE") {
          setLoadError(
            "Cannot reach database server. Please verify PostgreSQL connection."
          );
        } else if (err.statusCode === 401) {
          setLoadError("Session expired. Please log in again.");
        } else {
          setLoadError(err.message || "Failed to load lead details.");
        }
      } else {
        setLoadError("Unable to connect to backend API server.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !newNote.trim() || isSavingNote) return;

    setIsSavingNote(true);
    setNoteError(null);

    try {
      const res = await api.crm.recordActivity(lead.id, {
        type: "NOTE",
        description: newNote.trim(),
      });
      if (res?.activity) {
        setActivities((prev) => [res.activity, ...prev]);
        setNewNote("");
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setNoteError(err.message || "Failed to record CRM note.");
      } else {
        setNoteError("Failed to communicate with CRM service.");
      }
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleApprove = async () => {
    if (!lead) return;
    setIsSubmittingApproval(true);
    setApprovalError(null);

    try {
      const res = await api.leads.approve(lead.id, approvalNotes.trim() || undefined);
      if (res?.data) {
        setAiResult((prev) =>
          prev
            ? {
                ...prev,
                approval: {
                  status: "approved",
                  approvedBy: res.data.approval.approvedBy || "Operator",
                  approvedAt: res.data.approval.approvedAt || new Date().toISOString(),
                  reason: res.data.approval.reason || approvalNotes.trim() || undefined,
                },
              }
            : null
        );
        setLead((prev) => (prev ? { ...prev, status: "CALL_READY" } : null));
        onLeadUpdated?.();
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE") {
          setApprovalError("Cannot reach database server. PostgreSQL connection offline.");
        } else {
          setApprovalError(err.message || "Failed to approve lead.");
        }
      } else {
        setApprovalError("Failed to communicate with API server.");
      }
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleReject = async () => {
    if (!lead) return;
    setIsSubmittingApproval(true);
    setApprovalError(null);

    try {
      const res = await api.leads.reject(lead.id, approvalNotes.trim() || undefined);
      if (res?.data) {
        setAiResult((prev) =>
          prev
            ? {
                ...prev,
                approval: {
                  status: "rejected",
                  approvedBy: res.data.approval.approvedBy || "Operator",
                  approvedAt: res.data.approval.approvedAt || new Date().toISOString(),
                  reason: res.data.approval.reason || approvalNotes.trim() || undefined,
                },
              }
            : null
        );
        setLead((prev) => (prev ? { ...prev, status: "DISQUALIFIED" } : null));
        onLeadUpdated?.();
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE") {
          setApprovalError("Cannot reach database server. PostgreSQL connection offline.");
        } else {
          setApprovalError(err.message || "Failed to reject lead.");
        }
      } else {
        setApprovalError("Failed to communicate with API server.");
      }
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  useEffect(() => {
    if (isOpen && leadId) {
      fetchLeadDetails(leadId);
    } else {
      setLead(null);
      setAiResult(null);
      setLoadError(null);
      setAiError(null);
    }
  }, [isOpen, leadId, fetchLeadDetails]);

  const handleRunAiAnalysis = async () => {
    if (!leadId || isExecutingAi) return;

    setIsExecutingAi(true);
    setAiError(null);

    try {
      const response = await api.leads.runAi(leadId);
      if (response?.data) {
        setAiResult(response.data);
        if (response.data.status) {
          setLead((prev) => (prev ? { ...prev, status: response.data.status } : null));
        }
        onLeadUpdated?.();
      } else {
        setAiError("AI workflow completed without returning output data.");
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE") {
          setAiError(
            "Cannot reach database server. Please verify PostgreSQL connection."
          );
        } else if (err.statusCode === 401) {
          setAiError("Session expired. Please log in again.");
        } else {
          setAiError(err.message || "Failed to execute AI analysis workflow.");
        }
      } else {
        setAiError("Unable to communicate with AI workflow service.");
      }
    } finally {
      setIsExecutingAi(false);
    }
  };

  const audit = lead?.websiteAudits?.[0] || lead?.websiteAudit;
  const score = lead?.leadScore;

  const primaryEmail = lead?.email;
  const extraEmails = (lead?.additionalEmails || []).filter((e) => e !== primaryEmail);
  const hasEmail = Boolean(primaryEmail || extraEmails.length > 0);

  const extraPhones = (lead?.additionalPhones || []).filter(
    (p) => p !== lead?.phone && p.replace(/\s+/g, "") !== lead?.phone?.replace(/\s+/g, "")
  );

  const extraWebsites = (lead?.additionalWebsites || []).filter(
    (w) => w !== lead?.domain && getSafeWebsiteUrl(w) !== (lead?.domain ? getSafeWebsiteUrl(lead.domain) : "")
  );

  const isApproved = aiResult?.approval?.status === "approved";
  const isRejected = aiResult?.approval?.status === "rejected";
  const isDisqualifiedOrSkipped =
    !isApproved &&
    !isRejected &&
    (aiResult?.qualification?.qualified === false ||
      aiResult?.currentStep === "human_approval_skipped" ||
      aiResult?.status === "DISQUALIFIED" ||
      lead?.status === "DISQUALIFIED");
  const isPendingReview =
    !isApproved &&
    !isRejected &&
    !isDisqualifiedOrSkipped;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isExecutingAi) {
          onClose();
        }
      }}
      title={lead?.businessName || "Lead Intelligence Dossier"}
      description="Prospect operational records, website gap audits, and LangGraph AI analysis."
      className="!max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6 pt-2">
        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading lead intelligence...</p>
          </div>
        )}

        {/* Load Error Banner */}
        {loadError && !isLoading && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <svg
                className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="space-y-1">
                <p className="font-semibold">Unable to load lead data</p>
                <p className="text-rose-300/80 leading-relaxed">{loadError}</p>
              </div>
            </div>
            {leadId && (
              <button
                type="button"
                onClick={() => fetchLeadDetails(leadId)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors shrink-0 font-medium text-xs cursor-pointer"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Lead Details Content */}
        {lead && !isLoading && (
          <>
            {/* Lead Header Overview */}
            <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {lead.businessName}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Lead ID: {lead.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.dataQuality && (
                    <Badge
                      size="sm"
                      variant={
                        lead.dataQuality === "COMPLETE" || lead.dataQuality === "GOOD"
                          ? "success"
                          : lead.dataQuality === "PARTIAL"
                          ? "warning"
                          : "secondary"
                      }
                      dot
                      className="font-mono text-[10px] tracking-wide uppercase"
                    >
                      Quality: {lead.dataQuality}
                    </Badge>
                  )}
                  <LeadStatusSelect
                    leadId={lead.id}
                    currentStatus={mapBackendStatusToLeadStatus(lead.status)}
                    onStatusChange={async (newStatus) => {
                      setLead((prev) =>
                        prev ? { ...prev, status: mapLeadStatusToBackendStatus(newStatus) } : null
                      );
                      onLeadUpdated?.();
                      try {
                        const actRes = await api.crm.getActivities(lead.id);
                        if (actRes?.activities) {
                          setActivities(actRes.activities);
                        }
                      } catch {
                        // Non-blocking activity timeline refresh
                      }
                    }}
                  />
                </div>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                {/* Website / Domain (6 cols) */}
                <div className="sm:col-span-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                        Website / Domain
                      </span>
                    </div>

                    {lead.placeDetailsEnriched !== undefined && (
                      <Badge
                        size="sm"
                        variant={lead.placeDetailsEnriched ? "success" : "secondary"}
                        dot={lead.placeDetailsEnriched}
                        className="font-mono text-[9px] px-1.5 py-0 uppercase"
                      >
                        Enriched: {lead.placeDetailsEnriched ? "Yes" : "No"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {lead.domain ? (
                        <a
                          href={getSafeWebsiteUrl(lead.domain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open website: ${lead.domain}`}
                          title={lead.domain}
                          className="group inline-flex items-center gap-1.5 text-zinc-100 hover:text-white transition-colors max-w-full"
                        >
                          <span className="font-medium text-sm underline-offset-4 group-hover:underline truncate block">
                            {lead.domain}
                          </span>
                        </a>
                      ) : (
                        <span className="text-zinc-500 italic text-xs">Not available</span>
                      )}
                    </div>

                    {lead.domain && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(lead.domain || "", "domain")}
                          aria-label="Copy website domain"
                          title="Copy domain"
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                        >
                          {copiedField === "domain" ? (
                            <>
                              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <a
                          href={getSafeWebsiteUrl(lead.domain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open website: ${lead.domain}`}
                          title="Open website in new tab"
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                        >
                          <span>Visit</span>
                          <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>

                  {extraWebsites.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.04] space-y-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase block">Additional Websites</span>
                      <div className="flex flex-wrap gap-2">
                        {extraWebsites.map((w, idx) => (
                          <a
                            key={idx}
                            href={getSafeWebsiteUrl(w)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.04] transition-colors"
                          >
                            {w}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Number (6 cols) */}
                <div className="sm:col-span-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                      Phone Number
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                          aria-label={`Call ${lead.phone}`}
                          title={`Call ${lead.phone}`}
                          className="group inline-flex items-center gap-1.5 text-zinc-100 hover:text-white transition-colors"
                        >
                          <span className="font-mono text-sm font-medium tracking-wide underline-offset-4 group-hover:underline whitespace-nowrap">
                            {lead.phone}
                          </span>
                        </a>
                      ) : (
                        <span className="text-zinc-500 italic text-xs">Not available</span>
                      )}
                    </div>

                    {lead.phone && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(lead.phone || "", "phone")}
                          aria-label="Copy phone number"
                          title="Copy phone number"
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                        >
                          {copiedField === "phone" ? (
                            <>
                              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                          aria-label={`Call ${lead.phone}`}
                          title={`Call ${lead.phone}`}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                        >
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>Call</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {extraPhones.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.04] space-y-1">
                      <span className="text-[10px] text-zinc-500 font-mono uppercase block">Additional Phones</span>
                      <div className="flex flex-wrap gap-2">
                        {extraPhones.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">
                            <span>{p}</span>
                            <a
                              href={`tel:${p.replace(/\s+/g, "")}`}
                              aria-label={`Call ${p}`}
                              title={`Call ${p}`}
                              className="text-emerald-400 hover:text-emerald-300"
                            >
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Public Business Email (6 cols, only when email data present) */}
                {hasEmail && (
                  <div className="sm:col-span-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                        Business Email
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {primaryEmail ? (
                          <a
                            href={`mailto:${primaryEmail}`}
                            aria-label={`Email ${primaryEmail}`}
                            title={`Email ${primaryEmail}`}
                            className="group inline-flex items-center gap-1.5 text-zinc-100 hover:text-white transition-colors"
                          >
                            <span className="font-mono text-sm font-medium tracking-wide underline-offset-4 group-hover:underline truncate block">
                              {primaryEmail}
                            </span>
                          </a>
                        ) : (
                          <span className="text-zinc-500 italic text-xs">Primary not set</span>
                        )}
                      </div>

                      {primaryEmail && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(primaryEmail, "email")}
                            aria-label="Copy email address"
                            title="Copy email address"
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                          >
                            {copiedField === "email" ? (
                              <>
                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`mailto:${primaryEmail}`}
                            aria-label={`Send email to ${primaryEmail}`}
                            title={`Send email to ${primaryEmail}`}
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors"
                          >
                            <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Email</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {extraEmails.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.04] space-y-1">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase block">Additional Emails</span>
                        <div className="flex flex-wrap gap-2">
                          {extraEmails.map((em, idx) => (
                            <a
                              key={idx}
                              href={`mailto:${em}`}
                              className="text-[11px] font-mono text-zinc-300 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] px-2 py-0.5 rounded border border-white/[0.04] transition-colors"
                            >
                              {em}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Discovered Date */}
                <div className="sm:col-span-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                      Discovered / Ingested Date
                    </span>
                  </div>

                  <span className="text-zinc-200 font-medium text-sm font-mono">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not available"}
                  </span>
                </div>

                {/* Lead Source & Campaign */}
                <div className="sm:col-span-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                      Source &amp; Campaign
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-zinc-200 font-medium text-sm capitalize">
                      {lead.campaign?.name || "Discovery / Organic Intake"}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Channel: <span className="text-zinc-300">Lead Source Discovery</span>
                    </div>
                  </div>
                </div>

                {/* Google Places Rating & Reviews */}
                <div className="sm:col-span-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                      Rating &amp; Reviews
                    </span>
                  </div>

                  <div>
                    {lead.rating !== undefined || (lead.metadata as Record<string, unknown> | undefined)?.rating !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-mono font-semibold text-sm">
                          ★ {(lead.rating ?? (lead.metadata as Record<string, unknown> | undefined)?.rating) as number}
                        </span>
                        <span className="text-zinc-400 text-xs">
                          / 5.0
                          {((lead.userRatingsTotal !== undefined) || (lead.metadata as Record<string, unknown> | undefined)?.userRatingsTotal !== undefined) && (
                            <span className="ml-1 text-zinc-500 font-mono">
                              ({(lead.userRatingsTotal ?? (lead.metadata as Record<string, unknown> | undefined)?.userRatingsTotal) as number} reviews)
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic text-xs">Not available</span>
                    )}
                  </div>
                </div>

                {/* Location / Address */}
                <div className={`${hasEmail ? "sm:col-span-12" : "sm:col-span-8"} p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.09] transition-colors flex flex-col justify-between gap-2.5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 whitespace-nowrap">
                        Location / Address
                      </span>
                    </div>

                    {lead.mapsMatchStatus && (
                      <Badge
                        size="sm"
                        variant={lead.mapsMatchStatus === "TARGETED" ? "success" : "secondary"}
                        dot={lead.mapsMatchStatus === "TARGETED"}
                        className="font-mono text-[9px] px-1.5 py-0 uppercase"
                      >
                        Maps: {lead.mapsMatchStatus}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-start sm:items-center justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      {lead.address ? (
                        lead.mapsUrl && /^https?:\/\//i.test(lead.mapsUrl.trim()) ? (
                          <a
                            href={lead.mapsUrl.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open address in maps: ${lead.address}`}
                            title={`Open in maps: ${lead.address}`}
                            className="group block"
                          >
                            <p className="text-zinc-200 text-sm leading-relaxed whitespace-normal break-words group-hover:text-white group-hover:underline underline-offset-4 transition-colors">
                              {lead.address}
                            </p>
                          </a>
                        ) : (
                          <p className="text-zinc-200 text-sm leading-relaxed whitespace-normal break-words">
                            {lead.address}
                          </p>
                        )
                      ) : (
                        <span className="text-zinc-500 italic text-xs">Not available</span>
                      )}
                    </div>

                    {lead.address && (
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(lead.address || "", "address")}
                          aria-label="Copy address"
                          title="Copy address"
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                        >
                          {copiedField === "address" ? (
                            <>
                              <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        {lead.mapsUrl && /^https?:\/\//i.test(lead.mapsUrl.trim()) ? (
                          <a
                            href={lead.mapsUrl.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open address in maps: ${lead.address}`}
                            title="Open address in maps"
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                          >
                            <span>Maps</span>
                            <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-[11px] font-mono px-1.5 py-0.5">Maps link not available</span>
                        )}
                      </div>
                    )}
                  </div>

                  {((lead.latitude !== undefined && lead.longitude !== undefined) || lead.placeId) && (
                    <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono text-zinc-400">
                      {lead.latitude !== undefined && lead.longitude !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 text-[10px] uppercase">Coords:</span>
                          <span className="text-zinc-300">{lead.latitude.toFixed(6)}, {lead.longitude.toFixed(6)}</span>
                        </div>
                      )}
                      {lead.placeId && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-500 text-[10px] uppercase">Provider Place ID:</span>
                          <span className="text-zinc-300 truncate max-w-[200px]" title={lead.placeId}>{lead.placeId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(lead.placeId || "", "placeId")}
                            aria-label="Copy Provider Place ID"
                            title="Copy Provider Place ID"
                            className="text-zinc-500 hover:text-zinc-300"
                          >
                            {copiedField === "placeId" ? (
                              <span className="text-[10px] text-emerald-400">Copied</span>
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contacts Roster */}
            <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  Associated Contacts ({lead.contacts?.length || 0})
                </h4>
              </div>

              {lead.contacts && lead.contacts.length > 0 ? (
                <div className="divide-y divide-white/[0.04] border border-white/[0.04] rounded-lg overflow-hidden">
                  {lead.contacts.map((contact: BackendContact) => (
                    <div
                      key={contact.id}
                      className="p-3 bg-white/[0.01] flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {contact.fullName}
                          </span>
                          {contact.isPrimary && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {contact.title || "No title recorded"}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5 text-zinc-400 text-[11px]">
                        <div>{contact.email || "No email"}</div>
                        <div>{contact.phone || "No direct phone"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-2">
                  No individual contacts recorded for this lead yet.
                </p>
              )}
            </div>

            {/* CRM Notes & Activity Timeline (Phase 2.3 & 2.4 Server Grounded) */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#121216] border border-white/[0.08] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    CRM Activity &amp; Notes Timeline ({activities.length})
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Real Database Log</span>
              </div>

              {/* Add Note Input Form */}
              <form onSubmit={handleCreateNote} className="space-y-2">
                <label htmlFor="crm-note-field" className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                  Record Operator Note
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="crm-note-field"
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter call notes, client objection, or follow-up reason..."
                    disabled={isSavingNote}
                    className="flex-1 bg-[#14141c] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/25 transition-colors font-sans"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSavingNote || !newNote.trim()}
                    className="text-xs shrink-0 flex items-center gap-1.5"
                  >
                    {isSavingNote ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Add Note</span>
                        <span>+</span>
                      </>
                    )}
                  </Button>
                </div>
                {noteError && (
                  <p className="text-xs text-rose-400 font-mono mt-1">{noteError}</p>
                )}
              </form>

              {/* Real Timeline Stream */}
              {activities.length > 0 ? (
                <div className="divide-y divide-white/[0.04] border border-white/[0.04] rounded-lg overflow-hidden bg-white/[0.01] max-h-60 overflow-y-auto">
                  {activities.map((act) => (
                    <div key={act.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-medium ${
                            act.type === "STAGE_CHANGE"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                              : act.type === "NOTE"
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              : act.type === "CALL_LOG"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-white/[0.04] text-zinc-300 border-white/[0.08]"
                          }`}>
                            {act.type.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(act.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-zinc-200 text-xs leading-relaxed break-words whitespace-pre-wrap font-sans">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-white/[0.06] rounded-lg bg-white/[0.01] space-y-1">
                  <p className="text-xs text-zinc-400">No CRM notes or activity history recorded yet.</p>
                  <p className="text-[11px] text-zinc-500 font-mono">Stage changes and operator notes will appear here automatically.</p>
                </div>
              )}
            </div>

            {/* Stored Intelligence: Audit & Scoring (if available in lead data) */}
            {(audit || score) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {score && (
                  <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-2 text-xs">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      Lead Scoring
                    </h4>
                    <div className="flex items-baseline gap-3 pt-1">
                      <span className="text-2xl font-bold text-white font-mono">
                        {score.totalScore}
                      </span>
                      <span className="text-zinc-400 text-[11px]">/ 100 overall</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1">
                      <div>Relevance: {score.relevanceScore}/100</div>
                      <div>Opportunity: {score.opportunityScore}/100</div>
                    </div>
                    {score.reasoningRationale && (
                      <p className="text-[11px] text-zinc-400 pt-1 border-t border-white/[0.04]">
                        {score.reasoningRationale}
                      </p>
                    )}
                  </div>
                )}

                {audit && (
                  <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-2 text-xs">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      Website Audit
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                      <div>
                        Mobile Ready:{" "}
                        <span className={audit.mobileOptimized ? "text-emerald-400" : "text-zinc-500"}>
                          {audit.mobileOptimized ? "Yes" : "No"}
                        </span>
                      </div>
                      <div>
                        Booking CTA:{" "}
                        <span className={audit.bookingCtaVisible ? "text-emerald-400" : "text-zinc-500"}>
                          {audit.bookingCtaVisible ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                    {audit.summary && (
                      <p className="text-[11px] text-zinc-400 pt-1 border-t border-white/[0.04]">
                        {audit.summary}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* B4 Lead Actionability Section */}
            {lead.actionability && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#121216] border border-white/[0.08] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      Lead Actionability (B4 Intelligence)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      size="sm"
                      variant={
                        lead.actionability.tier === "READY"
                          ? "success"
                          : lead.actionability.tier === "ENRICHMENT_REQUIRED"
                          ? "warning"
                          : "secondary"
                      }
                      dot={lead.actionability.isActionable}
                      className="font-mono text-[10px] tracking-wide uppercase"
                    >
                      {lead.actionability.tier.replace(/_/g, " ")}
                    </Badge>
                    <Badge
                      size="sm"
                      variant={lead.actionability.isActionable ? "success" : "secondary"}
                      className="font-mono text-[10px] tracking-wide uppercase"
                    >
                      {lead.actionability.isActionable ? "Actionable" : "Not Actionable"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Eligible Channels */}
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                      Eligible Outbound Channels
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {lead.actionability.eligibleChannels && lead.actionability.eligibleChannels.length > 0 ? (
                        lead.actionability.eligibleChannels.map((channel) => (
                          <span
                            key={channel}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            {channel}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 italic text-[11px]">None eligible</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Fields */}
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                      Missing Required Fields
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {lead.actionability.missingFields && lead.actionability.missingFields.length > 0 ? (
                        lead.actionability.missingFields.map((field) => (
                          <span
                            key={field}
                            className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          >
                            {field}
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400/80 text-[11px] font-mono">None (Complete)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actionability Reasons */}
                {lead.actionability.reasons && lead.actionability.reasons.length > 0 && (
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                      Evaluation Reasons
                    </span>
                    <ul className="space-y-1 text-zinc-300 text-xs">
                      {lead.actionability.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span className="leading-relaxed">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Service Opportunity & Recommendation Section */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#121216] border border-white/[0.08] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Service Opportunity &amp; Recommended Service
                  </h4>
                </div>
                {lead.serviceRecommendation ? (
                  <Badge
                    size="sm"
                    variant={lead.serviceRecommendation.serviceOpportunity === "YES" ? "success" : "secondary"}
                    dot={lead.serviceRecommendation.serviceOpportunity === "YES"}
                    className="font-mono text-[10px] tracking-wide uppercase"
                  >
                    Opportunity: {lead.serviceRecommendation.serviceOpportunity}
                  </Badge>
                ) : (
                  <Badge size="sm" variant="outline" className="font-mono text-[10px] text-zinc-500">
                    Not evaluated
                  </Badge>
                )}
              </div>

              {lead.serviceRecommendation ? (
                <div className="space-y-3 text-xs">
                  {/* Service Opportunity & Recommended Service Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                        Service Opportunity
                      </span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span
                          className={`text-sm font-semibold font-mono ${
                            lead.serviceRecommendation.serviceOpportunity === "YES"
                              ? "text-emerald-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {lead.serviceRecommendation.serviceOpportunity}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {lead.serviceRecommendation.serviceOpportunity === "YES"
                            ? "(Actionable client opportunity)"
                            : "(No opportunity identified)"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                        Recommended Service
                      </span>
                      <div className="text-sm font-semibold text-white tracking-tight pt-0.5">
                        {lead.serviceRecommendation.recommendedService}
                      </div>
                    </div>
                  </div>

                  {/* Why / Reason */}
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                      Why
                    </span>
                    <p className="text-zinc-200 text-xs leading-relaxed break-words whitespace-pre-wrap">
                      {lead.serviceRecommendation.reason || "Not specified."}
                    </p>
                  </div>

                  {/* Evidence */}
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400 block">
                      Evidence
                    </span>
                    <p className="text-zinc-300 text-xs leading-relaxed font-mono bg-black/30 p-2.5 rounded border border-white/[0.04] break-words whitespace-pre-wrap">
                      {lead.serviceRecommendation.evidence || "Not specified."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-5 text-center rounded-lg bg-white/[0.01] border border-dashed border-white/[0.06] space-y-1">
                  <p className="text-xs text-zinc-400">
                    Service opportunity has not been evaluated for this prospect.
                  </p>
                  <p className="text-[11px] text-zinc-600 font-mono">
                    State: Not evaluated
                  </p>
                </div>
              )}
            </div>

            {/* AI Results & Execution Section */}
            <div className="p-5 rounded-xl bg-[#121216] border border-white/[0.08] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-zinc-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    AI Intelligence &amp; Analysis
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    LangGraph multi-step evaluation: research synthesis, qualification, and draft generation.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunAiAnalysis}
                  disabled={isExecutingAi}
                  className="flex items-center gap-2 text-xs font-medium"
                >
                  {isExecutingAi ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Executing AI Workflow...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Run AI Analysis</span>
                    </>
                  )}
                </Button>
              </div>

              {/* AI Error Alert */}
              {aiError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5">
                  <svg
                    className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="space-y-0.5">
                    <p className="font-semibold">AI Workflow Error</p>
                    <p className="text-rose-300/80 leading-relaxed">{aiError}</p>
                  </div>
                </div>
              )}

              {/* Running Loading Placeholder */}
              {isExecutingAi && (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">
                    Orchestrating LangGraph Agent Graph...
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Running research synthesis, qualification scoring, and message crafting.
                  </p>
                </div>
              )}

              {/* AI Real Results Display */}
              {aiResult && !isExecutingAi && (
                <div className="space-y-4">
                  {/* Workflow Execution Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400">Workflow Status:</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-white/10 text-white font-medium">
                        {aiResult.status}
                      </span>
                    </div>
                    <div className="text-zinc-500 text-[11px] font-mono">
                      Step: {aiResult.currentStep}
                    </div>
                  </div>

                  {/* 1. RESEARCH / AI INSIGHTS */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        1. RESEARCH / AI INSIGHTS
                      </h5>
                      {aiResult.aiResult?.confidence !== undefined && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-zinc-300">
                          Confidence: {Math.round(aiResult.aiResult.confidence <= 1 ? aiResult.aiResult.confidence * 100 : aiResult.aiResult.confidence)}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-0.5">
                          Prospect Summary:
                        </span>
                        <p className="text-zinc-200 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                          {aiResult.aiResult?.summary || "—"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-zinc-500">Detected Intent:</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/10 text-zinc-200">
                          {aiResult.aiResult?.intent || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. AI QUALIFICATION */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        2. AI QUALIFICATION
                      </h5>
                      <div className="flex items-center gap-2">
                        {aiResult.qualification?.qualified !== undefined && (
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                              aiResult.qualification.qualified
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            }`}
                          >
                            {aiResult.qualification.qualified ? "QUALIFIED" : "DISQUALIFIED"}
                          </span>
                        )}
                        {aiResult.qualification?.score !== undefined && (
                          <span className="text-[11px] font-mono text-zinc-400">
                            Score: {aiResult.qualification.score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs">
                      <span className="text-[11px] text-zinc-500 block mb-0.5">
                        Qualification Rationale:
                      </span>
                      <p className="text-zinc-200 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                        {aiResult.qualification?.reason || "—"}
                      </p>
                    </div>
                  </div>

                  {/* 3. PERSONALIZED OUTREACH DRAFT */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        3. PERSONALIZED OUTREACH DRAFT
                      </h5>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        DRAFT (NOT SENT)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {aiResult.personalizedMessage?.subject && (
                        <div>
                          <span className="text-[11px] text-zinc-500 block mb-0.5">
                            Subject:
                          </span>
                          <div className="text-white font-medium bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04]">
                            {aiResult.personalizedMessage.subject}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-[11px] text-zinc-500 block mb-0.5">
                          Draft Body:
                        </span>
                        <div className="text-zinc-200 whitespace-pre-wrap bg-white/[0.02] p-3 rounded-lg border border-white/[0.04] leading-relaxed font-sans text-xs">
                          {aiResult.personalizedMessage?.body || "—"}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-[10px] text-zinc-500 flex items-center gap-1.5 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span>Operator review draft only. Outbound dispatch is disabled.</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. QUALITY CHECK */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        4. QUALITY CHECK
                      </h5>
                      <div className="flex items-center gap-2">
                        {aiResult.qualityCheck?.passed === true && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            PASSED
                          </span>
                        )}
                        {aiResult.qualityCheck?.passed === false && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            FLAGGED
                          </span>
                        )}
                        {aiResult.qualityCheck && aiResult.qualityCheck.passed === undefined && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            NOT ASSESSED
                          </span>
                        )}
                        {!aiResult.qualityCheck && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                            SKIPPED
                          </span>
                        )}
                        {aiResult.qualityCheck?.score !== undefined && (
                          <span className="text-[11px] font-mono text-zinc-400">
                            QC Score: {aiResult.qualityCheck.score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs">
                      <span className="text-[11px] text-zinc-500 block mb-1">
                        Detected Issues:
                      </span>
                      {aiResult.qualityCheck?.issues && aiResult.qualityCheck.issues.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 text-amber-300/90 text-xs bg-amber-950/20 p-2.5 rounded-lg border border-amber-800/30">
                          {aiResult.qualityCheck.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      ) : aiResult.qualityCheck?.passed === false ? (
                        <p className="text-amber-300/80 text-[11px] italic bg-amber-950/20 p-2 rounded border border-amber-800/30">
                          Quality check did not pass.
                        </p>
                      ) : aiResult.qualityCheck?.passed === true ? (
                        <p className="text-zinc-400 text-[11px] italic">
                          No quality or compliance issues detected.
                        </p>
                      ) : (
                        <p className="text-zinc-400 text-[11px] italic">
                          Quality check was not executed for this lead.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 5. APPROVAL */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        5. APPROVAL
                      </h5>
                      <span
                        className={`text-[11px] font-mono px-2.5 py-0.5 rounded font-semibold uppercase ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : isRejected
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : isDisqualifiedOrSkipped
                            ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {isApproved
                          ? "APPROVED"
                          : isRejected
                          ? "REJECTED"
                          : isDisqualifiedOrSkipped
                          ? "NOT REQUIRED"
                          : "PENDING REVIEW"}
                      </span>
                    </div>

                    {/* Case A: Already Decided (Approved or Rejected) */}
                    {(isApproved || isRejected) && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1">
                          <div>
                            <span className="text-zinc-500 block">
                              {isApproved ? "Approved By:" : "Rejected By:"}
                            </span>
                            <span className="text-zinc-200 font-medium">
                              {aiResult.approval?.approvedBy || "Operator"}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">Decision Timestamp:</span>
                            <span className="text-zinc-200">
                              {aiResult.approval?.approvedAt
                                ? new Date(aiResult.approval.approvedAt).toLocaleString()
                                : "—"}
                            </span>
                          </div>
                        </div>

                        {aiResult.approval?.reason && (
                          <p className="text-[11px] text-zinc-300 pt-1 border-t border-white/[0.04] bg-white/[0.01] p-2 rounded">
                            <span className="text-zinc-500 font-mono uppercase text-[10px] block">Operator Notes:</span>
                            {aiResult.approval.reason}
                          </p>
                        )}

                        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-400 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? "bg-emerald-400" : "bg-rose-400"}`} />
                          <span>
                            {isApproved
                              ? "Lead status transitioned to CALL_READY. Eligible for Call Queue."
                              : "Lead status transitioned to DISQUALIFIED. Excluded from outbound queue."}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Case B: Disqualified / Approval Skipped */}
                    {isDisqualifiedOrSkipped && (
                      <div className="space-y-2 pt-1">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-400 space-y-2">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">
                              This lead was disqualified and did not enter the human approval queue.
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 pl-6 leading-relaxed">
                            Human approval is not required when a lead does not meet qualification criteria. No outbound calling or outreach will be scheduled.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Case C: Qualified + Pending Review (Interactive Operator Console) */}
                    {isPendingReview && (
                      <div className="space-y-3 pt-1">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Review the AI intelligence summary, qualification score, and drafted message above.
                          Authorizing moves the lead to <span className="text-white font-mono font-semibold">CALL_READY</span> status for the operations queue.
                        </p>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block">
                            Operator Notes / Reason (Optional)
                          </label>
                          <textarea
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            placeholder="Enter review feedback, target instructions, or rejection reason..."
                            rows={2}
                            disabled={isSubmittingApproval || isExecutingAi}
                            className="w-full bg-[#14141c] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/25 resize-none transition-colors"
                          />
                        </div>

                        {approvalError && (
                          <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
                            {approvalError}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 pt-1">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleApprove}
                            disabled={isSubmittingApproval || isExecutingAi}
                            className="text-xs flex items-center gap-1.5"
                          >
                            {isSubmittingApproval ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Approve &amp; Queue for Calling</span>
                              </>
                            )}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={isSubmittingApproval || isExecutingAi}
                            className="text-xs flex items-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Reject Lead</span>
                          </Button>
                        </div>

                        <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-[10px] text-zinc-500 flex items-center gap-2">
                          <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>
                            Stage 4 Safety Boundary: Operator authorization transitions lead to CALL_READY. Zero autonomous calls are placed.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pre-Analysis State */}
              {!aiResult && !isExecutingAi && (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <p className="text-xs text-zinc-400">
                    AI analysis has not been executed for this lead yet.
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Click &ldquo;Run AI Analysis&rdquo; to execute the LangGraph intelligence pipeline.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-white/[0.06]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isExecutingAi}
            className="text-xs"
          >
            Close Dossier
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
