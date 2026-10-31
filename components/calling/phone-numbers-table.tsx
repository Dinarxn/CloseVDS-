"use client";

import React, { useState, useMemo } from "react";
import {
  TelephonyPhoneNumber,
  PhoneNumberCapabilities,
  VoiceAgentConfig,
} from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";

export interface PhoneNumbersTableProps {
  numbers?: TelephonyPhoneNumber[];
  agents?: VoiceAgentConfig[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function PhoneNumbersTable({
  numbers = [],
  agents = [],
  isLoading = false,
  onRefresh,
}: PhoneNumbersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "UNASSIGNED">("ALL");

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPhone, setImportPhone] = useState("");
  const [importFriendlyName, setImportFriendlyName] = useState("");
  const [importAgentId, setImportAgentId] = useState("");
  const [importCaps, setImportCaps] = useState<PhoneNumberCapabilities | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Routing edit modal state
  const [editingNumber, setEditingNumber] = useState<TelephonyPhoneNumber | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [inboundWebhookUrl, setInboundWebhookUrl] = useState("");
  const [recordingConsent, setRecordingConsent] = useState(true);
  const [isSavingRouting, setIsSavingRouting] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  // Releasing state
  const [isReleasingId, setIsReleasingId] = useState<string | null>(null);

  // Filter numbers
  const filteredNumbers = useMemo(() => {
    return numbers.filter((num) => {
      const matchesSearch =
        num.phoneNumber.toLowerCase().includes(search.toLowerCase()) ||
        num.friendlyName.toLowerCase().includes(search.toLowerCase()) ||
        (num.assignedAgentName && num.assignedAgentName.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (statusFilter === "ACTIVE") return num.status === "ACTIVE";
      if (statusFilter === "UNASSIGNED") return !num.assignedAgentId;
      return true;
    });
  }, [numbers, search, statusFilter]);

  // Live capability check on import input change
  const handlePhoneInputChange = async (val: string) => {
    setImportPhone(val);
    setImportError(null);
    if (val.trim().startsWith("+") && val.trim().length >= 8) {
      try {
        const res = await api.voice.validatePhoneNumber(val.trim());
        if (res.success && res.data) {
          setImportCaps(res.data);
        }
      } catch {
        // Non-blocking capability preview
      }
    } else {
      setImportCaps(null);
    }
  };

  // Submit import number
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPhone.trim()) {
      setImportError("Phone number is required");
      return;
    }
    if (!importPhone.trim().startsWith("+")) {
      setImportError("Phone number must start with international country code (e.g. +15125550199)");
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      await api.voice.importPhoneNumber({
        phoneNumber: importPhone.trim(),
        friendlyName: importFriendlyName.trim() || undefined,
        assignedAgentId: importAgentId || null,
      });

      setIsImportModalOpen(false);
      setImportPhone("");
      setImportFriendlyName("");
      setImportAgentId("");
      setImportCaps(null);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setImportError(err.message);
      } else {
        setImportError("Failed to import carrier phone number.");
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Open routing modal
  const handleOpenRouting = (num: TelephonyPhoneNumber) => {
    setEditingNumber(num);
    setSelectedAgentId(num.assignedAgentId || "");
    setInboundWebhookUrl(num.inboundWebhookUrl || "https://api.closevds.com/api/v1/voice/webhooks/twilio");
    setRecordingConsent(true);
    setRoutingError(null);
  };

  // Save routing
  const handleSaveRouting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNumber) return;

    setIsSavingRouting(true);
    setRoutingError(null);

    try {
      await api.voice.configurePhoneNumberRouting(editingNumber.id, {
        phoneNumber: editingNumber.phoneNumber,
        targetAgentId: selectedAgentId || undefined,
        webhookUrl: inboundWebhookUrl || undefined,
        recordingEnabled: recordingConsent,
      });

      setEditingNumber(null);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setRoutingError(err.message);
      } else {
        setRoutingError("Failed to update routing configuration.");
      }
    } finally {
      setIsSavingRouting(false);
    }
  };

  // Release number
  const handleRelease = async (id: string, phone: string) => {
    if (!window.confirm(`Are you sure you want to release ${phone} from this workspace?`)) {
      return;
    }

    setIsReleasingId(id);
    try {
      await api.voice.releasePhoneNumber(id);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to release number");
    } finally {
      setIsReleasingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Carrier Phone Numbers
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#7D39EB]/10 text-[#C6FF33] border border-[#7D39EB]/30 font-semibold">
                Twilio PSTN
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                BYO Carrier Only (No Auto-Buy)
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Workspace assigned telephony lines for outbound voice outreach and inbound agent routing. Numbers are imported from existing carrier accounts without automatic purchasing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#7D39EB] hover:bg-[#6b2fd4] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Import Existing Line
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-4 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search number, label, agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-panel border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#7D39EB]/60 font-mono transition-colors"
            />
            <svg
              className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {(["ALL", "ACTIVE", "UNASSIGNED"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md transition-colors ${
                  statusFilter === tab
                    ? "bg-white/[0.10] text-white font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {tab === "ALL" ? `All (${numbers.length})` : tab === "ACTIVE" ? "Active" : "Unassigned"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400 font-mono animate-pulse">
            Loading workspace carrier lines...
          </div>
        ) : filteredNumbers.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-xs text-zinc-400 font-sans">No carrier phone numbers registered in this workspace.</p>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="text-xs text-[#C6FF33] hover:underline font-mono"
            >
              + Import your first carrier line
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Phone Number
                  </th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Friendly Name
                  </th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Capabilities
                  </th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Assigned Agent
                  </th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredNumbers.map((num) => (
                  <tr key={num.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Phone Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-white tracking-tight">
                          {num.phoneNumber}
                        </span>
                        {num.capabilities.e164 && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20" title="Valid International E.164">
                            E.164
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Friendly Name */}
                    <td className="py-3.5 px-4 text-xs text-zinc-300 font-sans">
                      {num.friendlyName || "Unnamed Line"}
                    </td>

                    {/* Capabilities Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {num.capabilities.voice && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#C6FF33]/10 text-[#C6FF33] border border-[#C6FF33]/30 font-semibold">
                            VOICE
                          </span>
                        )}
                        {num.capabilities.sms && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.08] font-medium">
                            SMS
                          </span>
                        )}
                        {num.capabilities.tollFree && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                            TOLL-FREE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Assigned Voice Agent */}
                    <td className="py-3.5 px-4">
                      {num.assignedAgentId ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7D39EB]/15 text-purple-200 border border-[#7D39EB]/30 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7D39EB]" />
                          <span className="truncate max-w-[140px] font-medium">
                            {num.assignedAgentName || agents.find((a) => a.id === num.assignedAgentId)?.name || "Assigned Agent"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">Unassigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/25 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] animate-pulse" />
                        {num.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRouting(num)}
                          className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-zinc-300 font-mono transition-colors"
                        >
                          Route
                        </button>
                        <button
                          type="button"
                          disabled={isReleasingId === num.id}
                          onClick={() => handleRelease(num.id, num.phoneNumber)}
                          className="px-2 py-1 rounded-md text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-mono transition-colors disabled:opacity-50"
                        >
                          {isReleasingId === num.id ? "..." : "Release"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Import Existing Number */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-white/[0.12] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Import Existing Carrier Line
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                  Register your existing Twilio or carrier-provisioned phone number for closeVDS voice operations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                ✕
              </button>
            </div>

            {/* Zero Auto-Purchase Security Guarantee Banner */}
            <div className="rounded-xl border border-lime-500/30 bg-[#0d1409] p-3 flex items-start gap-2.5">
              <span className="text-[#C6FF33] font-bold text-xs mt-0.5">✓</span>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-semibold text-lime-300 uppercase tracking-wider font-mono">
                  No Automatic Purchasing Policy
                </h5>
                <p className="text-xs text-lime-200/80 leading-relaxed font-sans">
                  CloseVDS never buys carrier numbers automatically. You must bring pre-existing numbers from your own Twilio console.
                </p>
              </div>
            </div>

            {importError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-sans">
                {importError}
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                  Phone Number (International E.164) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+15125550199"
                  value={importPhone}
                  onChange={(e) => handlePhoneInputChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-panel border border-white/[0.10] text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#7D39EB] font-mono"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Must include leading country code (e.g. +1 for US/Canada, +44 for UK).
                </span>
              </div>

              {/* Live Capabilities Preview */}
              {importCaps && (
                <div className="p-3 rounded-lg bg-surface-panel border border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-sans">Validated Capabilities:</span>
                  <div className="flex items-center gap-1.5">
                    {importCaps.voice && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#C6FF33]/15 text-[#C6FF33] border border-[#C6FF33]/30 font-semibold">
                        Voice Ready
                      </span>
                    )}
                    {importCaps.sms && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.08]">
                        SMS
                      </span>
                    )}
                    {importCaps.tollFree && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300">
                        Toll-Free
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                  Friendly Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Austin SDR Primary Line"
                  value={importFriendlyName}
                  onChange={(e) => setImportFriendlyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-panel border border-white/[0.10] text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#7D39EB] font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                  Initial Voice Agent Assignment (Optional)
                </label>
                <select
                  value={importAgentId}
                  onChange={(e) => setImportAgentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-panel border border-white/[0.10] text-xs text-white focus:outline-hidden focus:border-[#7D39EB] font-sans"
                >
                  <option value="">No Agent (Unassigned Line)</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.callObjective.slice(0, 30)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="px-4 py-2 rounded-lg bg-[#7D39EB] hover:bg-[#6b2fd4] text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {isImporting ? "Importing Line..." : "Register Number"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configure Routing */}
      {editingNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface-card border border-white/[0.12] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Configure Call Routing
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  Line: {editingNumber.phoneNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingNumber(null)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                ✕
              </button>
            </div>

            {routingError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-sans">
                {routingError}
              </div>
            )}

            <form onSubmit={handleSaveRouting} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                  Assigned Voice Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-panel border border-white/[0.10] text-xs text-white focus:outline-hidden focus:border-[#7D39EB] font-sans"
                >
                  <option value="">None (Unassigned / Outbound Only)</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-sans">
                  Twilio Inbound Webhook URL
                </label>
                <input
                  type="url"
                  value={inboundWebhookUrl}
                  onChange={(e) => setInboundWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-panel border border-white/[0.10] text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#7D39EB] font-mono"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-panel border border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-white font-sans">Consent Recording</span>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    Record audio stream for post-call quality &amp; transcript verification.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={recordingConsent}
                  onChange={(e) => setRecordingConsent(e.target.checked)}
                  className="w-4 h-4 accent-[#7D39EB] rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setEditingNumber(null)}
                  className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRouting}
                  className="px-4 py-2 rounded-lg bg-[#7D39EB] hover:bg-[#6b2fd4] text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  {isSavingRouting ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
