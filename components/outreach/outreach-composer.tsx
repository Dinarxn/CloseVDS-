"use client";

import React, { useState, useEffect } from "react";
import { Lead } from "@/types/leads";
import { OutreachChannel, OutreachTemplate, CallLogOutcome } from "@/types/outreach";
import { OUTREACH_TEMPLATES, interpolateTemplate, buildWhatsAppLink, buildMailtoLink } from "@/lib/outreach-templates";
import { api, ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isValidEmail, isValidPhone } from "@/lib/lead-import";

export interface OutreachComposerProps {
  lead: Lead | null;
  onActivityLogged?: () => void;
  onDraftCreated?: () => void;
}

export function OutreachComposer({
  lead,
  onActivityLogged,
  onDraftCreated,
}: OutreachComposerProps) {
  const [activeChannel, setActiveChannel] = useState<OutreachChannel>("email");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  // Email fields
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // Phone Call Outcome fields
  const [callOutcome, setCallOutcome] = useState<CallLogOutcome>("CONNECTED_INTERESTED");
  const [callNotes, setCallNotes] = useState("");

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-dismiss banners
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // When lead changes, reset composer and load matching template
  useEffect(() => {
    if (!lead) {
      setSubject("");
      setBody("");
      setSelectedTemplateId("");
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    // Pick sensible default template for channel
    const channelTemplates = OUTREACH_TEMPLATES.filter((t) => t.channel === activeChannel);
    if (channelTemplates.length > 0) {
      const defaultTmpl = channelTemplates[0];
      setSelectedTemplateId(defaultTmpl.id);
      applyTemplate(defaultTmpl, lead);
    } else {
      setSelectedTemplateId("");
      setSubject("");
      setBody("");
    }
  }, [lead, activeChannel]);

  const applyTemplate = (template: OutreachTemplate, currentLead: Lead) => {
    const context = {
      businessName: currentLead.companyName,
      contactName: currentLead.contactName,
      domain: currentLead.website?.replace(/^https?:\/\//, ""),
      city: currentLead.city,
      phone: currentLead.phone,
      email: currentLead.email,
      serviceOpportunity: currentLead.serviceRecommendation?.recommendedService,
      observedGaps: currentLead.websiteAudit?.observedGaps,
    };

    if (template.subjectTemplate) {
      setSubject(interpolateTemplate(template.subjectTemplate, context));
    }
    setBody(interpolateTemplate(template.bodyTemplate, context));
  };

  const handleTemplateChange = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!lead) return;
    const tmpl = OUTREACH_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      applyTemplate(tmpl, lead);
    }
  };

  // Channel switch
  const handleChannelSwitch = (channel: OutreachChannel) => {
    setActiveChannel(channel);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center bg-[#0a0a0e] border border-white/[0.08] rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-white">Select a Lead to Begin Outreach</h3>
        <p className="text-xs text-zinc-400 max-w-sm mt-1 leading-relaxed">
          Choose a qualified lead from the directory on the left to prepare personalized email, WhatsApp, or phone engagement.
        </p>
      </div>
    );
  }

  const isOptedOut = lead.status === "opted_out";

  // Actions
  const handleQueueBackendDraft = async () => {
    if (!lead || isSubmitting) return;
    if (!body.trim()) {
      setErrorMessage("Please enter a message body before creating a draft.");
      return;
    }
    if (activeChannel === "email" && !subject.trim()) {
      setErrorMessage("Please enter an email subject line.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.outreach.create({
        leadId: lead.id,
        subject: subject.trim() || `Outreach to ${lead.companyName}`,
        bodyText: body.trim(),
        toEmail: lead.email,
        fromName: "closeVDS Operator",
      });

      setSuccessMessage("Draft created and placed in the Permission Review Queue (Gate 1).");
      onDraftCreated?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Failed to create outreach draft.");
      } else {
        setErrorMessage("Unable to save draft to backend service.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEmailClient = () => {
    if (!lead.email) {
      setErrorMessage("Lead does not have a verified email address.");
      return;
    }
    const mailto = buildMailtoLink(lead.email, subject, body);
    window.location.href = mailto;
    setSuccessMessage("Default email client opened. Click 'Log Email Sent' below after sending.");
  };

  const handleLogEmailSent = async () => {
    if (!lead || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.crm.recordActivity(lead.id, {
        type: "EMAIL_SENT",
        description: `Email sent to ${lead.email || lead.companyName} with subject: "${subject}"`,
        metadata: {
          toEmail: lead.email,
          subject,
          previewSnippet: body.substring(0, 100),
        },
      });

      // Update lead stage to contacted if current is early stage
      if (lead.status === "discovered" || lead.status === "analyzing" || lead.status === "qualified" || lead.status === "outreach_ready") {
        await api.crm.updateStage(lead.id, {
          status: "CONTACTED",
          note: "Outreach email sent to recipient",
        });
      }

      setSuccessMessage("Email outreach successfully logged to CRM activity timeline.");
      onActivityLogged?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Failed to record CRM activity.");
      } else {
        setErrorMessage("Failed to record activity with CRM service.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!lead.phone) {
      setErrorMessage("Lead does not have a phone number for WhatsApp.");
      return;
    }
    const link = buildWhatsAppLink(lead.phone, body);
    if (!link) {
      setErrorMessage("Phone number contains insufficient digits for WhatsApp.");
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
    setSuccessMessage("WhatsApp Web opened in new tab. Remember to click 'Log WhatsApp Sent' once delivered.");
  };

  const handleLogWhatsAppSent = async () => {
    if (!lead || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.crm.recordActivity(lead.id, {
        type: "NOTE",
        description: `WhatsApp message sent to ${lead.phone || lead.companyName}: "${body.substring(0, 120)}..."`,
        metadata: {
          channel: "whatsapp",
          phone: lead.phone,
          snippet: body.substring(0, 120),
        },
      });

      if (lead.status === "discovered" || lead.status === "analyzing" || lead.status === "qualified" || lead.status === "outreach_ready") {
        await api.crm.updateStage(lead.id, {
          status: "CONTACTED",
          note: "WhatsApp message dispatched to recipient",
        });
      }

      setSuccessMessage("WhatsApp outreach successfully logged to CRM timeline.");
      onActivityLogged?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Failed to record CRM activity.");
      } else {
        setErrorMessage("Failed to record WhatsApp activity.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCall = async () => {
    if (!lead || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const outcomeLabelMap: Record<CallLogOutcome, string> = {
        CONNECTED_INTERESTED: "Connected · Interested Prospect",
        CONNECTED_FOLLOWUP: "Connected · Follow-up Requested",
        LEFT_VOICEMAIL: "Left Voicemail",
        NO_ANSWER: "No Answer / Ringing",
        GATEKEEPER_REJECTION: "Gatekeeper Rejection",
        WRONG_NUMBER: "Wrong Number / Disconnected",
      };

      const outcomeDesc = outcomeLabelMap[callOutcome] || callOutcome;
      const fullDesc = `Phone call to ${lead.phone || lead.companyName}. Outcome: ${outcomeDesc}.${
        callNotes.trim() ? ` Notes: ${callNotes.trim()}` : ""
      }`;

      await api.crm.recordActivity(lead.id, {
        type: "CALL_LOG",
        description: fullDesc,
        metadata: {
          phone: lead.phone,
          outcome: callOutcome,
          notes: callNotes.trim(),
        },
      });

      // Advance stage appropriately
      if (callOutcome === "CONNECTED_INTERESTED") {
        await api.crm.updateStage(lead.id, {
          status: "INTERESTED",
          note: `Positive phone call outcome: ${callNotes.trim() || "Prospect expressed interest"}`,
        });
      } else if (callOutcome === "CONNECTED_FOLLOWUP") {
        await api.crm.updateStage(lead.id, {
          status: "IN_FOLLOWUP",
          note: `Follow-up requested on call: ${callNotes.trim()}`,
        });
      } else if (lead.status === "discovered" || lead.status === "analyzing" || lead.status === "qualified" || lead.status === "outreach_ready") {
        await api.crm.updateStage(lead.id, {
          status: "CONTACTED",
          note: `Call attempted. Outcome: ${outcomeDesc}`,
        });
      }

      setSuccessMessage("Phone call outcome recorded in CRM activity log.");
      setCallNotes("");
      onActivityLogged?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Failed to record call log.");
      } else {
        setErrorMessage("Failed to communicate with CRM service.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogCustomNote = async () => {
    if (!lead || !body.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await api.crm.recordActivity(lead.id, {
        type: "NOTE",
        description: body.trim(),
      });
      setSuccessMessage("Note recorded to lead's CRM timeline.");
      setBody("");
      onActivityLogged?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message || "Failed to save note.");
      } else {
        setErrorMessage("Failed to save note to CRM.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-xs">
      {/* Header Context Bar */}
      <div className="p-3.5 bg-[#0f0f14] border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">{lead.companyName}</h3>
            {lead.qualification?.totalScore !== undefined && (
              <Badge variant="solid" className="text-[10px] font-mono px-1.5 py-0">
                {lead.qualification.totalScore} pts
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
            {lead.contactName && <span>Attn: <strong className="text-zinc-200">{lead.contactName}</strong></span>}
            {lead.email && <span>&bull; {lead.email}</span>}
            {lead.phone && <span>&bull; {lead.phone}</span>}
            {lead.city && <span>&bull; {lead.city}</span>}
          </div>
        </div>

        {/* Channel Selector Pills */}
        <div className="flex items-center gap-1 bg-[#15151c] p-1 rounded-lg border border-white/[0.06] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleChannelSwitch("email")}
            disabled={isOptedOut}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              activeChannel === "email"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => handleChannelSwitch("whatsapp")}
            disabled={isOptedOut}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              activeChannel === "whatsapp"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => handleChannelSwitch("phone")}
            disabled={isOptedOut}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              activeChannel === "phone"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Phone Call
          </button>
          <button
            type="button"
            onClick={() => handleChannelSwitch("manual")}
            disabled={isOptedOut}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
              activeChannel === "manual"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-zinc-400 hover:text-white"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            Manual Note
          </button>
        </div>
      </div>

      {/* Main Composer Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Opt-out Regulatory Lockdown */}
        {isOptedOut && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase font-mono tracking-wider">
              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Regulatory Suppression Active · Opt-Out Prohibited</span>
            </div>
            <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
              This lead has exercised their regulatory right to opt out of marketing communications.
              In accordance with CAN-SPAM, TCPA, and CloseVDS data privacy policies, outbound email, WhatsApp messages, and phone calls are strictly blocked for this contact.
            </p>
          </div>
        )}

        {/* Feedback Banners */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-2">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {!isOptedOut && (
          <>
            {/* Channel-Specific Configuration & Templates */}
            {activeChannel !== "manual" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1">
                <label className="text-xs font-semibold text-zinc-300 font-sans">
                  Copy Template:
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full sm:w-auto text-xs px-2.5 py-1.5 rounded-lg bg-[#14141c] border border-white/[0.1] text-zinc-200 focus:outline-none focus:border-white/30 cursor-pointer"
                  aria-label="Select outreach template"
                >
                  {OUTREACH_TEMPLATES.filter((t) => t.channel === activeChannel).map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* EMAIL CHANNEL VIEW */}
            {activeChannel === "email" && (
              <div className="space-y-3.5">
                {/* Recipient Email & Missing Warning */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Recipient Email:</span>
                    {lead.email && !isValidEmail(lead.email) && (
                      <span className="text-amber-400 text-[11px]">Format warning</span>
                    )}
                  </div>
                  <Input
                    type="email"
                    value={lead.email || ""}
                    disabled
                    placeholder="No email recorded for this lead"
                    className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300"
                  />
                  {!lead.email && (
                    <p className="text-[11px] text-amber-400/90 font-mono">
                      ⚠️ Lead lacks an email address. Direct sending disabled.
                    </p>
                  )}
                </div>

                {/* Email Subject Line */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400">Subject Line:</label>
                  <Input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="h-9 text-xs bg-white/[0.03] border-white/[0.1] text-white focus:border-white/30"
                  />
                </div>

                {/* Email Message Body */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-zinc-400">Message Content:</label>
                    <span className="text-[11px] font-mono text-zinc-500">{body.length} characters</span>
                  </div>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    className="text-xs bg-white/[0.03] border-white/[0.1] text-white leading-relaxed focus:border-white/30 font-sans"
                    placeholder="Compose email draft..."
                  />
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleQueueBackendDraft}
                    disabled={isSubmitting || !body.trim()}
                    className="text-xs"
                  >
                    {isSubmitting ? "Saving..." : "Queue Backend Draft (Gate 1)"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEmailClient}
                      disabled={!lead.email}
                      className="text-xs"
                    >
                      Open Email App (mailto:)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleLogEmailSent}
                      disabled={isSubmitting || !lead.email}
                      className="text-xs font-semibold"
                    >
                      Log Email Sent
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* WHATSAPP CHANNEL VIEW */}
            {activeChannel === "whatsapp" && (
              <div className="space-y-3.5">
                {/* Phone & Validation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Recipient Phone:</span>
                    {lead.phone && isValidPhone(lead.phone) && (
                      <span className="text-emerald-400 text-[11px]">Valid format</span>
                    )}
                  </div>
                  <Input
                    type="text"
                    value={lead.phone || ""}
                    disabled
                    placeholder="No phone number recorded"
                    className="h-8 text-xs bg-white/[0.03] border-white/[0.08] text-zinc-300 font-mono"
                  />
                  {!lead.phone && (
                    <p className="text-[11px] text-amber-400/90 font-mono">
                      ⚠️ Lead lacks a phone number. WhatsApp messaging unavailable.
                    </p>
                  )}
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-zinc-400">WhatsApp Message:</label>
                    <span className="text-[11px] font-mono text-zinc-500">{body.length} characters</span>
                  </div>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="text-xs bg-white/[0.03] border-white/[0.1] text-white leading-relaxed focus:border-white/30 font-sans"
                    placeholder="Type WhatsApp message..."
                  />
                </div>

                {/* Explicit Disclaimer */}
                <div className="p-3 rounded-lg bg-[#14141c] border border-white/[0.08] text-[11px] text-zinc-400 space-y-1">
                  <span className="font-semibold text-zinc-300 font-mono uppercase tracking-wider block">
                    WhatsApp Delivery Notice:
                  </span>
                  <p className="leading-snug">
                    Clicking &quot;Open WhatsApp Web&quot; launches your WhatsApp chat with the pre-filled text. It does not automatically transmit or confirm receipt. Once sent in WhatsApp, click &quot;Log WhatsApp Sent&quot; below to record the verified activity in your CRM.
                  </p>
                </div>

                {/* Action Bar */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenWhatsApp}
                    disabled={!lead.phone}
                    className="text-xs"
                  >
                    Open WhatsApp Web
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLogWhatsAppSent}
                    disabled={isSubmitting || !lead.phone}
                    className="text-xs font-semibold"
                  >
                    {isSubmitting ? "Logging..." : "Log WhatsApp Sent"}
                  </Button>
                </div>
              </div>
            )}

            {/* PHONE CALL CHANNEL VIEW */}
            {activeChannel === "phone" && (
              <div className="space-y-4">
                {/* Phone & Dial Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#111118] border border-white/[0.08] rounded-xl">
                  <div>
                    <span className="text-[11px] text-zinc-400 uppercase font-mono block">Direct Phone Number</span>
                    <span className="text-sm font-bold font-mono text-white">{lead.phone || "No phone number available"}</span>
                  </div>

                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Dial (tel:)</span>
                    </a>
                  )}
                </div>

                {/* Call Talking Points & Script */}
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Call Talking Points &amp; Script:</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="text-xs bg-white/[0.03] border-white/[0.1] text-zinc-200 font-sans leading-relaxed"
                  />
                </div>

                {/* Log Call Outcome Form */}
                <div className="p-3.5 bg-[#101016] border border-white/[0.08] rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
                    Log Real Call Outcome
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Outcome Status:</label>
                      <select
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value as CallLogOutcome)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-[#181822] border border-white/[0.1] text-zinc-200 focus:outline-none focus:border-white/30"
                      >
                        <option value="CONNECTED_INTERESTED">Connected · Interested Prospect</option>
                        <option value="CONNECTED_FOLLOWUP">Connected · Follow-up Requested</option>
                        <option value="LEFT_VOICEMAIL">Left Voicemail</option>
                        <option value="NO_ANSWER">No Answer / Ringing</option>
                        <option value="GATEKEEPER_REJECTION">Gatekeeper Rejection</option>
                        <option value="WRONG_NUMBER">Wrong Number / Disconnected</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Call Notes &amp; Observations:</label>
                      <Input
                        type="text"
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        placeholder="e.g. Spoke with Dr. Marcus, requested callback Friday 2pm"
                        className="h-8 text-xs bg-white/[0.03] border-white/[0.1] text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleLogCall}
                      disabled={isSubmitting}
                      className="text-xs font-semibold"
                    >
                      {isSubmitting ? "Saving Log..." : "Save Call Log to CRM"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL NOTE CHANNEL VIEW */}
            {activeChannel === "manual" && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">
                    Record Manual Outreach or Interaction Note:
                  </label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    placeholder="e.g. Met representative at local conference, shared portfolio card..."
                    className="text-xs bg-white/[0.03] border-white/[0.1] text-white leading-relaxed focus:border-white/30"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleLogCustomNote}
                    disabled={isSubmitting || !body.trim()}
                    className="text-xs font-semibold"
                  >
                    {isSubmitting ? "Recording..." : "Record Note to Lead Timeline"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
