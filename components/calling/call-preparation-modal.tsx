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
  onCallCreated?: (callId: string) => void;
}

interface CampaignOption {
  id: string;
  name: string;
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
  onCallCreated,
}: CallPreparationModalProps) {
  const [campaignId, setCampaignId] = useState(initialCampaignId);
  const [leadId, setLeadId] = useState(initialLeadId);
  const [contactId, setContactId] = useState(initialContactId);

  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
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
  }, [initialCampaignId, initialLeadId, initialContactId]);

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
        const [cRes, lRes] = await Promise.allSettled([
          api.campaigns.list({ limit: 50 }),
          api.leads.list({ limit: 100 }),
        ]);

        if (cRes.status === "fulfilled") {
          const val = cRes.value;
          const items: CampaignOption[] = Array.isArray(val?.data)
            ? (val.data as unknown as CampaignOption[])
            : [];
          setCampaigns(items);
          setCampaignId((curr) => curr || items[0]?.id || "");
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
  const availableContacts = React.useMemo(() => selectedLead?.contacts || [], [selectedLead]);

  useEffect(() => {
    if (availableContacts.length > 0 && (!contactId || !availableContacts.some((c) => c.id === contactId))) {
      setContactId(availableContacts[0].id);
    }
  }, [leadId, availableContacts, contactId]);

  const handlePrepare = async () => {
    const resolvedCampaignId = campaignId || selectedLead?.campaignId || undefined;
    if (!leadId || !contactId) {
      setErrorMsg("Prospect and Decision Maker Contact must both be selected.");
      return;
    }

    if (selectedLead?.status === "OPT_OUT") {
      setErrorMsg("This prospect has requested opt-out (OPT_OUT). Autonomous safety gates will block call preparation.");
      return;
    }

    const selectedContact = availableContacts.find((c) => c.id === contactId);
    const targetPhone = selectedContact?.phone || selectedLead?.phone;
    if (!targetPhone) {
      setErrorMsg("Selected prospect and contact have no phone number on file. A valid phone number is required.");
      return;
    }

    setIsPreparing(true);
    setErrorMsg(null);
    setPrepResult(null);

    try {
      const res = await api.voice.prepareCall({
        campaignId: resolvedCampaignId,
        leadId,
        contactId,
      });

      if (res.data) {
        setPrepResult(res.data);
      }
    } catch (err: unknown) {
      console.error("Preparation failed:", err);
      const msg = err instanceof ApiClientError ? err.message : "Failed to run server-side call preparation.";
      setErrorMsg(msg);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleCreateCall = async () => {
    const resolvedCampaignId = campaignId || selectedLead?.campaignId || undefined;
    if (!leadId || !contactId) {
      setErrorMsg("Prospect and Decision Maker Contact must both be selected.");
      return;
    }

    if (selectedLead?.status === "OPT_OUT") {
      setErrorMsg("This prospect has requested opt-out (OPT_OUT). Autonomous safety gates will block call creation.");
      return;
    }

    const selectedContact = availableContacts.find((c) => c.id === contactId);
    const targetPhone = selectedContact?.phone || selectedLead?.phone;
    if (!targetPhone) {
      setErrorMsg("Selected prospect and contact have no phone number on file. A valid phone number is required.");
      return;
    }

    setIsCreating(true);
    setErrorMsg(null);

    try {
      const res = await api.voice.createCall({
        campaignId: resolvedCampaignId,
        leadId,
        contactId,
        humanApprovalRequired: true, // Strict human approval
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
          <div className="p-6 rounded-xl bg-[#0e0e16] border border-white/[0.08] text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] text-white flex items-center justify-center mx-auto text-base font-bold">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Call Prepared &amp; Queued</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Call ID <span className="font-mono text-zinc-200">{createdCallId}</span> has been securely created.
                Because autonomous dialling is strictly forbidden, this call requires explicit human review and approval.
              </p>
            </div>
            <div className="flex justify-center items-center gap-3 pt-1">
              <CallStatusBadge status="APPROVAL_REQUIRED" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-3.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-lg bg-white text-black hover:bg-zinc-200 border border-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
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
              <div className="space-y-4 pt-2 border-t border-[#404040]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">Pre-Flight Safety Gate Result:</span>
                    <CallStatusBadge status={prepResult.status} />
                  </div>
                  <span className="text-xs font-mono text-[#a3a3a3]">
                    Target Phone: {prepResult.normalizedPhone}
                  </span>
                </div>

                {!prepResult.safetyCheck.passed && (
                  <Alert variant="destructive" title="Safety Evaluator Warning">
                    {prepResult.safetyCheck.blockedReason || "Call failed one or more mandatory safety gates."}
                  </Alert>
                )}

                {/* Visually Partitioned Grounded Context */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Grounded Context Partitions (Anti-Hallucination Framework)
                  </div>

                  {/* 1. VERIFIED FACTS */}
                  <div className="p-3.5 rounded-lg bg-[#0e0e16] border border-white/[0.07] space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
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
                  <div className="p-3.5 rounded-lg bg-[#0e0e16] border border-white/[0.07] space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
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
                      <p className="text-xs text-zinc-500">No critical technical deficiencies flagged.</p>
                    )}
                  </div>

                  {/* 3. TARGET OFFER & NICHE */}
                  <div className="p-3.5 rounded-lg bg-[#0e0e16] border border-white/[0.07] space-y-2">
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
                  <div className="p-3.5 rounded-lg bg-[#0e0e16] border border-white/[0.07] space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
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
                      <p className="text-xs text-zinc-500">Initial outreach and qualification discovery.</p>
                    )}
                  </div>

                  {/* 5. UNKNOWN INFORMATION (PROHIBITED) */}
                  <div className="p-3.5 rounded-lg bg-[#0e0e16] border border-white/[0.07] space-y-1.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80" />
                      <span>Prohibited Assertions (Anti-Hallucination Guardrails)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Competitor pricing, proprietary tech stack details, internal executive contacts, unverified revenue numbers. The AI agent is strictly prohibited from asserting these items as facts.
                    </p>
                  </div>
                </div>

                {/* Creation Boundary */}
                <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs font-mono text-zinc-400">
                    Will be placed in <span className="text-zinc-200 font-semibold">APPROVAL_REQUIRED</span> status.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPrepResult(null)}
                      className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
                    >
                      Reconfigure
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCall}
                      disabled={isCreating}
                      className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 border border-white text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
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
