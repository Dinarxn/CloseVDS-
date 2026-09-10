"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "./lead-status-badge";
import { api, ApiClientError } from "@/lib/api-client";
import { type BackendLead, type BackendContact, mapBackendStatusToLeadStatus } from "@/lib/mappers";
import type { LeadAiWorkflowResult } from "@/types/leads";

export interface LeadDetailModalProps {
  isOpen: boolean;
  leadId: string | null;
  onClose: () => void;
  onLeadUpdated?: () => void;
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

  const [isExecutingAi, setIsExecutingAi] = useState(false);
  const [aiResult, setAiResult] = useState<LeadAiWorkflowResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchLeadDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    setLoadError(null);
    setAiResult(null);
    setAiError(null);

    try {
      const response = await api.leads.get(id);
      if (response?.lead) {
        setLead(response.lead);
      } else {
        setLoadError("Lead not found or access denied for this workspace.");
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
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
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
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-3">
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
                  <LeadStatusBadge status={mapBackendStatusToLeadStatus(lead.status)} />
                </div>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Domain
                  </span>
                  {lead.domain ? (
                    <a
                      href={
                        lead.domain.startsWith("http")
                          ? lead.domain
                          : `https://${lead.domain}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline truncate block"
                    >
                      {lead.domain}
                    </a>
                  ) : (
                    <span className="text-zinc-500">—</span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Phone
                  </span>
                  <span className="text-zinc-200 truncate block">
                    {lead.phone || "—"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Address
                  </span>
                  <span className="text-zinc-200 truncate block" title={lead.address || undefined}>
                    {lead.address || "—"}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                    Discovered
                  </span>
                  <span className="text-zinc-200 block">
                    {lead.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
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

                  {/* 1. AI Summary & Intent */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        1. Intelligence Synthesis &amp; Intent
                      </h5>
                      {aiResult.aiResult?.confidence !== undefined && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-zinc-300">
                          Confidence: {Math.round(aiResult.aiResult.confidence * 100)}%
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

                  {/* 2. Qualification Assessment */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        2. Qualification Assessment
                      </h5>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                            aiResult.qualification?.qualified
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {aiResult.qualification?.qualified ? "QUALIFIED" : "DISQUALIFIED"}
                        </span>
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

                  {/* 3. Personalized Message */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      3. Personalized Message
                    </h5>

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
                    </div>
                  </div>

                  {/* 4. Quality Check */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        4. Quality Check
                      </h5>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                            aiResult.qualityCheck?.passed
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {aiResult.qualityCheck?.passed ? "PASSED" : "FLAGGED"}
                        </span>
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
                      ) : (
                        <p className="text-zinc-400 text-[11px] italic">
                          No quality or compliance issues detected.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 5. Human Approval Status (Read-Only Safety Display) */}
                  <div className="p-4 rounded-xl bg-[#0e0e12] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        5. Human Approval Status
                      </h5>
                      <span
                        className={`text-[11px] font-mono px-2.5 py-0.5 rounded font-semibold uppercase ${
                          aiResult.approval?.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : aiResult.approval?.status === "rejected"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {aiResult.approval?.status || "PENDING"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 pt-1">
                      <div>
                        <span className="text-zinc-500 block">Approved By:</span>
                        <span className="text-zinc-200">
                          {aiResult.approval?.approvedBy || "Awaiting Reviewer Assignment"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Approved At:</span>
                        <span className="text-zinc-200">
                          {aiResult.approval?.approvedAt || "—"}
                        </span>
                      </div>
                    </div>

                    {aiResult.approval?.reason && (
                      <p className="text-[11px] text-zinc-400 pt-1 border-t border-white/[0.04]">
                        Reason: {aiResult.approval.reason}
                      </p>
                    )}

                    {/* Step 20 Safety Boundary Indicator */}
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] text-zinc-500 flex items-center gap-2 mt-2">
                      <svg
                        className="w-3.5 h-3.5 text-zinc-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>
                        Stage 4 Safety Boundary: Outbound communication is halted pending human review. Approval decisions are governed in Step 20.
                      </span>
                    </div>
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
