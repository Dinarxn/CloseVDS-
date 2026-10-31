"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { api, ApiClientError } from "@/lib/api-client";
import { CallPreparationResult } from "@/types/calling";
import { CallStatusBadge } from "./call-status-badge";

export interface CallPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCampaignId?: string;
  initialLeadId?: string;
  initialContactId?: string;
  initialAgentConfigId?: string;
  onCallCreated?: (callId: string) => void;
}

interface CampaignOption {
  id: string;
  name: string;
}

interface AgentOption {
  id: string;
  name: string;
  callObjective?: string;
}

interface LeadOption {
  id: string;
  businessName: string;
  phone?: string | null;
  status?: string;
  campaignId?: string;
  contacts: Array<{ id: string; fullName: string; phone?: string; title?: string }>;
}

export function CallPreparationModal({
  isOpen,
  onClose,
  initialCampaignId = "",
  initialLeadId = "",
  initialContactId = "",
  initialAgentConfigId = "",
  onCallCreated,
}: CallPreparationModalProps) {
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [leadId, setLeadId] = useState(initialLeadId);
  const [contactId, setContactId] = useState(initialContactId);
  const [agentConfigId, setAgentConfigId] = useState(initialAgentConfigId);

  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const [isPreparing, setIsPreparing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [prepResult, setPrepResult] = useState<CallPreparationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdCallId, setCreatedCallId] = useState<string | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialCampaignId) setCampaignId(initialCampaignId);
    if (initialLeadId) setLeadId(initialLeadId);
    if (initialContactId) setContactId(initialContactId);
    if (initialAgentConfigId) setAgentConfigId(initialAgentConfigId);
  }, [initialCampaignId, initialLeadId, initialContactId, initialAgentConfigId]);

  // Load campaigns and leads on open
  useEffect(() => {
    if (!isOpen) {
      setPrepResult(null);
      setErrorMsg(null);
      setCreatedCallId(null);
      return;
    }

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      setErrorMsg(null);
      try {
        const [cRes, lRes, aRes] = await Promise.allSettled([
          api.campaigns.list({ limit: 50 }),
          api.leads.list({ limit: 100 }),
          api.voice.getAgentConfigs(),
        ]);

        if (cRes.status === "fulfilled") {
          const val = cRes.value;
          const items: CampaignOption[] = Array.isArray(val?.data)
            ? (val.data as unknown as CampaignOption[])
            : [];
          setCampaigns(items);
          setCampaignId((curr) => curr || items[0]?.id || "");
        }

        if (aRes.status === "fulfilled" && aRes.value?.data) {
          const agents: AgentOption[] = Array.isArray(aRes.value.data)
            ? aRes.value.data.map((a: AgentOption) => ({
                id: a.id,
                name: a.name,
                callObjective: a.callObjective,
              }))
            : [];
          setAgentConfigs(agents);
          setAgentConfigId((curr) => curr || agents[0]?.id || "");
        }

        if (lRes.status === "fulfilled") {
          const val = lRes.value;
          const items: LeadOption[] = Array.isArray(val)
            ? (val as unknown as LeadOption[])
            : Array.isArray(val?.data)
            ? (val.data as unknown as LeadOption[])
            : [];
          setLeads(items);
          setLeadId((curr) => {
            const chosen = curr || items[0]?.id || "";
            if (chosen) {
              const matched = items.find((l) => l.id === chosen);
              if (matched?.contacts?.length) {
                setContactId((cCurr) => cCurr || matched.contacts[0].id);
              }
            }
            return chosen;
          });
        }
      } catch (err) {
        console.error("Failed to load call preparation dependencies:", err);
        setErrorMsg("Failed to load workspace prospects and telephony state.");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, [isOpen]);

  // When selected lead changes, update contacts
  const selectedLead = leads.find((l) => l.id === leadId);
  const availableContacts = selectedLead?.contacts || [];

  const handlePrepare = async () => {
    if (!leadId || !contactId) {
      setErrorMsg("Please select both a target prospect and contact.");
      return;
    }

    setIsPreparing(true);
    setErrorMsg(null);

    try {
      const res = await api.voice.prepareCall({
        leadId,
        contactId,
        campaignId: campaignId || undefined,
        agentConfigId: agentConfigId || undefined,
      });

      if (res.data) {
        setPrepResult(res.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Call preparation failed. Check prospect phone validity.");
      }
    } finally {
      setIsPreparing(false);
    }
  };

  const handleCreateCall = async () => {
    if (!leadId || !contactId) return;

    setIsCreating(true);
    setErrorMsg(null);

    try {
      const res = await api.voice.createCall({
        leadId,
        contactId,
        campaignId: campaignId || undefined,
        agentConfigId: agentConfigId || undefined,
        humanApprovalRequired: true,
      });

      if (res.data) {
        setCreatedCallId(res.data.id);
        onCallCreated?.(res.data.id);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to queue call for human approval.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Prepare AI Voice Call"
      description="Execute server-side grounded context synthesis, verify 18 safety gates, and review factual boundaries before queueing."
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      {errorMsg && (
        <Alert variant="destructive" title="Preparation Blocked / Error">
          {errorMsg}
        </Alert>
      )}

      {createdCallId ? (
        <div className="p-6 rounded-xl bg-surface-panel border border-white/[0.08] text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-lime-500/10 border border-lime-500/25 text-[#C6FF33] flex items-center justify-center mx-auto text-base font-bold">
            ✓
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Call Prepared &amp; Queued</h4>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
              Call ID <span className="font-mono text-white font-semibold">{createdCallId}</span> has been securely created.
              Because autonomous dialing is strictly forbidden, this call requires explicit human review and approval.
            </p>
          </div>
          <div className="flex justify-center items-center gap-3 pt-1">
            <CallStatusBadge status="APPROVAL_REQUIRED" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 px-3.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-panel border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Close &amp; Return to Queue
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {!isLoadingOptions && leads.length === 0 && (
            <Alert variant="warning" title="No Prospects in Lead Pool">
              No prospects found in your Lead Pool. Connect closeBDS or import prospects with verified phone numbers to prepare calls.
            </Alert>
          )}

          {campaigns.length > 0 && (
            <Select
              id="prep-campaign"
              label="Acquisition Campaign (Optional)"
              value={campaignId}
              disabled={isLoadingOptions || isPreparing}
              placeholder="Select Campaign (Optional)"
              onChange={(e) => {
                setCampaignId(e.target.value);
                setPrepResult(null);
              }}
              options={[
                { value: "", label: "No Campaign Linked (Direct Prospect Outreach)" },
                ...campaigns.map((c) => ({ value: c.id, label: c.name })),
              ]}
              helperText="Associates call with campaign intelligence offer"
            />
          )}

          {agentConfigs.length > 0 && (
            <Select
              id="prep-agent"
              label="Voice Agent Persona"
              value={agentConfigId}
              disabled={isLoadingOptions || isPreparing}
              placeholder="Select Voice Agent"
              onChange={(e) => {
                setAgentConfigId(e.target.value);
                setPrepResult(null);
              }}
              options={agentConfigs.map((a) => ({
                value: a.id,
                label: `${a.name}${a.callObjective ? ` (${a.callObjective.substring(0, 32)}...)` : ""}`,
              }))}
              helperText="Determines voice identity, approved talking points, and conversational guardrails"
            />
          )}

          {/* Target Selectors: Prospect & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              id="prep-lead"
              label="Target Prospect"
              value={leadId}
              disabled={isLoadingOptions || leads.length === 0 || isPreparing}
              placeholder={isLoadingOptions ? "Loading prospects..." : leads.length === 0 ? "No prospects available" : "Select Target Prospect"}
              onChange={(e) => {
                setLeadId(e.target.value);
                setPrepResult(null);
              }}
              options={leads.map((l) => ({
                value: l.id,
                label: l.status === "OPT_OUT" ? `${l.businessName} [OPTED OUT]` : l.businessName,
              }))}
              helperText="Verified prospect from Lead Pool"
            />

            <Select
              id="prep-contact"
              label="Decision Maker Contact"
              value={contactId}
              disabled={isLoadingOptions || availableContacts.length === 0 || isPreparing}
              placeholder={
                !leadId
                  ? "Select a prospect first"
                  : availableContacts.length === 0
                  ? "No contacts on this prospect"
                  : "Select Contact"
              }
              onChange={(e) => {
                setContactId(e.target.value);
                setPrepResult(null);
              }}
              options={availableContacts.map((c) => ({
                value: c.id,
                label: `${c.fullName} (${c.title || "Decision Maker"}${c.phone ? ` • ${c.phone}` : " • No Phone"})`,
              }))}
              helperText={
                availableContacts.find((c) => c.id === contactId)?.phone
                  ? `Dial target: ${availableContacts.find((c) => c.id === contactId)?.phone}`
                  : "Verified phone required"
              }
            />
          </div>

          {selectedLead?.status === "OPT_OUT" && (
            <Alert variant="warning" title="Prospect Opted Out / Suppressed">
              This prospect has requested opt-out (OPT_OUT). Server safety gates strictly enforce suppression and will block call preparation and dispatch.
            </Alert>
          )}

          {selectedLead && !availableContacts.some((c) => c.phone) && !selectedLead.phone && (
            <Alert variant="destructive" title="No Phone Number Available">
              This prospect and its contacts have no telephone number on file. A valid telephone number is required to synthesize and prepare an AI call.
            </Alert>
          )}

          {/* Run Pre-Flight Action Button */}
          {!prepResult && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handlePrepare}
                disabled={
                  isPreparing ||
                  isLoadingOptions ||
                  !leadId ||
                  !contactId ||
                  leads.length === 0 ||
                  availableContacts.length === 0
                }
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isPreparing && (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                <span>{isPreparing ? "Synthesizing Grounded Context..." : "Run Pre-Flight Safety & Context"}</span>
              </button>
            </div>
          )}

          {/* Pre-Flight Results Display */}
          {prepResult && (
            <div className="space-y-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Pre-Flight Safety Gate Result:</span>
                  <CallStatusBadge status={prepResult.status} />
                </div>
                <span className="text-xs font-mono text-zinc-300">
                  Target Phone: <span className="text-white font-semibold">{prepResult.normalizedPhone}</span>
                </span>
              </div>

              {!prepResult.safetyCheck.passed && (
                <Alert variant="destructive" title="Safety Evaluator Warning">
                  {prepResult.safetyCheck.blockedReason || "Call failed one or more mandatory safety gates."}
                </Alert>
              )}

              {/* Target Prospect & Timezone Banner */}
              <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold mb-0.5">
                    Target Prospect &amp; Timezone
                  </span>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{prepResult.lead?.businessName || selectedLead?.businessName || "Verified Prospect"}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-white/[0.08] text-zinc-300">
                      {selectedLead?.status || "QUALIFIED"}
                    </span>
                  </div>
                  <div className="text-zinc-400 font-mono text-[11px] mt-0.5">
                    {prepResult.contact?.fullName || "Decision Maker"} • {prepResult.normalizedPhone}
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold mb-0.5">
                    Resolved Timezone
                  </span>
                  <span className="text-xs font-mono font-medium text-[#C6FF33] px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/25">
                    {prepResult.recipientTimezone || "America/New_York"}
                  </span>
                </div>
              </div>

              {/* Pre-Flight Checklist Grid */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
                  <span>Pre-Flight Safety Matrix (18-Gate Compliance Audit)</span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {prepResult.safetyCheck.evaluatedGates.filter(g => g.passed).length}/
                    {prepResult.safetyCheck.evaluatedGates.length} Invariants Passed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {prepResult.safetyCheck.evaluatedGates.slice(0, 8).map((gate) => (
                    <div
                      key={gate.gateNumber}
                      className="p-2.5 rounded-lg bg-surface-panel border border-white/[0.06] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[11px] font-medium text-white truncate block">
                          {gate.gateName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Gate {gate.gateNumber}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 font-semibold ${
                          gate.passed
                            ? "bg-lime-500/10 text-[#C6FF33] border border-lime-500/25"
                            : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                        }`}
                      >
                        {gate.passed ? "Passed" : "Blocked"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visually Partitioned Grounded Context */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Grounded Context Partitions (Anti-Hallucination Framework)
                </div>

                {/* 1. VERIFIED FACTS */}
                <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_rgba(198,255,51,0.6)]" />
                    <span>Verified Facts (Authoritative Source Data)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-200">
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px]">Business: </span>
                      <span className="text-white font-medium">
                        {prepResult.groundedContext?.leadFacts?.businessName || selectedLead?.businessName}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px]">Contact: </span>
                      <span className="text-white font-medium">
                        {prepResult.groundedContext?.leadFacts?.contactName || "Verified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px]">Phone: </span>
                      <span className="font-mono text-white">
                        {prepResult.normalizedPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px]">Website: </span>
                      <span className="font-mono text-white">
                        {prepResult.groundedContext?.leadFacts?.domain || "None verified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. OBSERVED WEBSITE GAPS */}
                <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>Observed Website Intelligence (Audited Deficiencies)</span>
                  </div>
                  {prepResult.groundedContext?.observedGaps && prepResult.groundedContext.observedGaps.length > 0 ? (
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {prepResult.groundedContext.observedGaps.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-500 font-mono text-xs">•</span>
                          <span>{gap.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">No critical technical deficiencies flagged.</p>
                  )}
                </div>

                {/* 3. TARGET OFFER & NICHE */}
                <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    <span>Target Offer &amp; Positioning Niche</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px]">Niche: </span>
                      <span className="text-white">
                        {prepResult.groundedContext?.campaignOffer?.niche || "General B2B"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono text-[11px]">Value Proposition: </span>
                      <span className="text-white">
                        {prepResult.groundedContext?.campaignOffer?.targetOffer || "Automated client acquisition"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. APPROVED TALKING POINTS */}
                <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
                    <span>Approved Dialogue Boundaries</span>
                  </div>
                  {prepResult.groundedContext?.approvedTalkingPoints && prepResult.groundedContext.approvedTalkingPoints.length > 0 ? (
                    <ul className="space-y-1 text-xs text-zinc-300">
                      {prepResult.groundedContext.approvedTalkingPoints.map((tp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-zinc-500 font-mono text-xs">•</span>
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">Initial outreach and qualification discovery.</p>
                  )}
                </div>

                {/* 5. UNKNOWN INFORMATION (PROHIBITED) */}
                <div className="p-3.5 rounded-xl bg-surface-panel border border-rose-500/30 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>Prohibited Assertions (Anti-Hallucination Guardrails)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    Competitor pricing, proprietary tech stack details, internal executive contacts, unverified revenue numbers. The AI agent is strictly prohibited from asserting these items as facts.
                  </p>
                </div>
              </div>

              {/* Human Approval Sign-Off Invariant Notice */}
              <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs space-y-1">
                <div className="flex items-center gap-2 text-violet-300 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span>Mandatory Human Approval Gate (Invariant)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  Autonomous dialing is strictly prohibited. Submitting will create this call in <span className="font-mono text-amber-300 font-semibold">APPROVAL_REQUIRED</span> status, requiring explicit human operator review before carrier dispatch.
                </p>
              </div>

              {/* Creation Boundary */}
              <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-mono text-zinc-400">
                  Will be placed in <span className="text-amber-300 font-semibold font-mono">APPROVAL_REQUIRED</span> status.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPrepResult(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-panel border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    Reconfigure
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCall}
                    disabled={isCreating}
                    className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isCreating ? "Queueing Call..." : "Queue for Human Approval"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
