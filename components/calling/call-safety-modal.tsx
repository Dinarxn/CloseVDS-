"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { api, ApiClientError } from "@/lib/api-client";
import { VoiceSafetyCheckResult, WorkspaceCallingPolicy } from "@/types/calling";

export interface CallSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId?: string;
  onPolicyUpdated?: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export function CallSafetyModal({ isOpen, onClose, callId, onPolicyUpdated }: CallSafetyModalProps) {
  const [activeTab, setActiveTab] = useState<string>(callId ? "call-gates" : "policy");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [isTogglingKillSwitch, setIsTogglingKillSwitch] = useState(false);
  const [safetyResult, setSafetyResult] = useState<VoiceSafetyCheckResult | null>(null);
  const [policy, setPolicy] = useState<WorkspaceCallingPolicy | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Policy form state
  const [dailyLimit, setDailyLimit] = useState(50);
  const [windowStart, setWindowStart] = useState("09:00");
  const [windowEnd, setWindowEnd] = useState("17:00");
  const [retryDelay, setRetryDelay] = useState(120);
  const [allowedDays, setAllowedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [recordingConsent, setRecordingConsent] = useState(true);
  const [humanApproval, setHumanApproval] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setSafetyResult(null);
      setErrorMsg(null);
      setSuccessMsg(null);
      return;
    }

    if (callId) {
      setActiveTab("call-gates");
    } else {
      setActiveTab("policy");
    }

    const loadData = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const [pRes, sRes] = await Promise.allSettled([
          api.voice.getPolicy(),
          callId ? api.voice.checkSafety(callId) : Promise.resolve(null),
        ]);

        if (pRes.status === "fulfilled" && pRes.value?.data) {
          const p = pRes.value.data;
          setPolicy(p);
          setDailyLimit(p.dailyCallLimit || 50);
          setWindowStart(p.callingWindowStart || "09:00");
          setWindowEnd(p.callingWindowEnd || "17:00");
          setRetryDelay(p.retryDelayMinutes || 120);
          setAllowedDays(p.allowedCallingDays || [1, 2, 3, 4, 5]);
          setRecordingConsent(p.recordingConsent ?? true);
          setHumanApproval(p.humanApprovalRequired ?? true);
        }

        if (sRes.status === "fulfilled" && sRes.value && "data" in sRes.value && sRes.value.data) {
          setSafetyResult(sRes.value.data as VoiceSafetyCheckResult);
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Failed to load workspace calling policy.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, callId]);

  const handleToggleKillSwitch = async () => {
    if (!policy) return;
    setIsTogglingKillSwitch(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const willHalt = policy.isActive; // if currently active, will halt
    try {
      const res = await api.voice.toggleKillSwitch({
        active: willHalt,
        reason: willHalt
          ? "Emergency Kill Switch engaged by workspace operator."
          : "Emergency Kill Switch cleared. Outreach resumed.",
      });

      if (res.data) {
        setPolicy((prev) => (prev ? { ...prev, isActive: !res.data.active } : null));
        setSuccessMsg(
          res.data.active
            ? "Emergency Kill Switch is ACTIVE. All outbound voice outreach is strictly halted."
            : "Emergency Kill Switch cleared. Outbound voice calling resumed."
        );
        onPolicyUpdated?.();
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to toggle Emergency Kill Switch.");
      }
    } finally {
      setIsTogglingKillSwitch(false);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.voice.updatePolicy({
        dailyCallLimit: dailyLimit,
        callingWindowStart: windowStart,
        callingWindowEnd: windowEnd,
        retryDelayMinutes: retryDelay,
        allowedCallingDays: allowedDays,
        recordingConsent,
        humanApprovalRequired: humanApproval,
      });

      if (res.data) {
        setPolicy(res.data);
        setSuccessMsg("Workspace calling policy invariants successfully saved.");
        onPolicyUpdated?.();
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save workspace calling policy.");
      }
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const toggleDay = (day: number) => {
    setAllowedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Calling Safety & Policy Control Center"
      description="Enforce multi-tenant safety invariants, emergency kill switches, daily call limits, and 18-gate compliance."
      className="max-w-2xl max-h-[88vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive" title="Safety System Error">
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="default" title="Safety System Notification">
            {successMsg}
          </Alert>
        )}

        {/* Emergency Kill Switch Banner */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            policy?.isActive
              ? "bg-surface-card border-white/[0.08]"
              : "bg-rose-950/30 border-rose-500/40"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  policy?.isActive
                    ? "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.6)]"
                    : "bg-rose-500 animate-pulse"
                }`}
              />
              <span className="font-semibold text-xs text-white">
                {policy?.isActive
                  ? "Workspace Outbound Calling: ACTIVE"
                  : "Emergency Kill Switch: ENGAGED"}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              {policy?.isActive
                ? "Outbound voice calling is enabled under workspace policy. Engage kill switch to instantly halt all calling."
                : "All voice dispatches and call preparations are strictly blocked for this workspace."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleKillSwitch}
            disabled={isTogglingKillSwitch || !policy}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              policy?.isActive
                ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35"
                : "bg-lime-500/15 hover:bg-lime-500/25 text-[#C6FF33] border border-lime-500/35"
            } disabled:opacity-50`}
          >
            {isTogglingKillSwitch
              ? "Executing..."
              : policy?.isActive
              ? "Engage Kill Switch"
              : "Clear Kill Switch"}
          </button>
        </div>

        {/* Tab Selection if callId is present */}
        {callId ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="call-gates">
            <TabList className="w-full bg-surface-panel border border-white/[0.08] p-1 rounded-xl">
              <Tab value="call-gates" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Live Call 18-Gate Audit
              </Tab>
              <Tab value="policy" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Workspace Policy Settings
              </Tab>
            </TabList>

            <TabPanel value="call-gates" className="pt-3">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-zinc-400 font-mono">
                  <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Evaluating 18-point safety invariants against database...
                </div>
              ) : safetyResult ? (
                <div className="space-y-4">
                  {/* Status Summary Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                      safetyResult.passed
                        ? "bg-lime-500/15 text-[#C6FF33] border-lime-500/35"
                        : "bg-rose-950/40 text-rose-300 border-rose-500/35"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          safetyResult.passed ? "bg-[#C6FF33]" : "bg-rose-500"
                        }`}
                      />
                      <span className="font-sans">
                        {safetyResult.passed
                          ? "Safe for Outbound Dispatch"
                          : "Call Blocked by Safety Enclosure"}
                      </span>
                    </div>
                    <span className="font-mono text-[11px]">
                      {safetyResult.evaluatedGates.filter((g) => g.passed).length}/
                      {safetyResult.evaluatedGates.length} Gates Passed
                    </span>
                  </div>

                  {safetyResult.blockedReason && (
                    <Alert variant="destructive" title="Primary Block Reason">
                      {safetyResult.blockedReason}
                    </Alert>
                  )}

                  {/* Gate breakdown list */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                      18 Evaluated Compliance Invariants
                    </span>

                    <div className="divide-y divide-white/[0.04] bg-surface-panel rounded-xl border border-white/[0.08] overflow-hidden text-xs max-h-72 overflow-y-auto">
                      {safetyResult.evaluatedGates.map((gate) => (
                        <div
                          key={gate.gateName || gate.gateNumber}
                          className="p-3 flex items-start justify-between gap-3 hover:bg-surface-elevated/50 transition-colors"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  gate.passed ? "bg-[#C6FF33]" : "bg-rose-500"
                                }`}
                              />
                              <span className="font-semibold text-white font-mono text-[11px] truncate">
                                {gate.gateName || `Gate ${gate.gateNumber}`}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 pl-3.5 leading-relaxed font-sans">
                              {gate.reason}
                            </p>
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
                </div>
              ) : null}
            </TabPanel>

            <TabPanel value="policy" className="pt-3">
              {renderPolicyForm()}
            </TabPanel>
          </Tabs>
        ) : (
          renderPolicyForm()
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose} className="border-white/[0.08]">
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );

  function renderPolicyForm() {
    return (
      <form onSubmit={handleSavePolicy} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Daily Limit */}
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-panel border border-white/[0.08]">
            <label className="text-[11px] font-medium text-white block">
              Workspace Daily Call Limit
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500"
            />
            <p className="text-[10px] text-zinc-500 font-sans">
              Strict cap on total outbound calls dispatched per day.
            </p>
          </div>

          {/* Retry Delay */}
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-panel border border-white/[0.08]">
            <label className="text-[11px] font-medium text-white block">
              Retry Cooldown (Minutes)
            </label>
            <input
              type="number"
              min={1}
              max={1440}
              value={retryDelay}
              onChange={(e) => setRetryDelay(Number(e.target.value))}
              className="w-full bg-surface-elevated border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500"
            />
            <p className="text-[10px] text-zinc-500 font-sans">
              Minimum cooldown delay required before redialing a lead.
            </p>
          </div>

          {/* Calling Window Start */}
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-panel border border-white/[0.08]">
            <label className="text-[11px] font-medium text-white block">
              Calling Window Start (Local Time)
            </label>
            <input
              type="text"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="09:00"
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
              className="w-full bg-surface-elevated border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500"
            />
            <p className="text-[10px] text-zinc-500 font-sans">
              Permissible hour (HH:MM in recipient&apos;s resolved timezone).
            </p>
          </div>

          {/* Calling Window End */}
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-panel border border-white/[0.08]">
            <label className="text-[11px] font-medium text-white block">
              Calling Window End (Local Time)
            </label>
            <input
              type="text"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="17:00"
              value={windowEnd}
              onChange={(e) => setWindowEnd(e.target.value)}
              className="w-full bg-surface-elevated border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500"
            />
            <p className="text-[10px] text-zinc-500 font-sans">
              Permissible close hour (HH:MM in recipient&apos;s resolved timezone).
            </p>
          </div>
        </div>

        {/* Allowed Days */}
        <div className="p-3 rounded-xl bg-surface-panel border border-white/[0.08] space-y-2">
          <label className="text-[11px] font-medium text-white block">
            Permissible Calling Days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((d) => {
              const active = allowedDays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                    active
                      ? "bg-violet-600 border-violet-500 text-white"
                      : "bg-surface-elevated border-white/[0.08] text-zinc-400 hover:text-white"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-zinc-500 font-sans">
            Calls attempted outside these days will fail Gate 9 and be blocked.
          </p>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-panel border border-white/[0.08] flex items-center justify-between gap-2">
            <div>
              <span className="font-medium text-white block text-[11px]">Human Approval Gate</span>
              <span className="text-[10px] text-zinc-400">Strict invariant: requires operator sign-off</span>
            </div>
            <input
              type="checkbox"
              checked={humanApproval}
              onChange={(e) => setHumanApproval(e.target.checked)}
              className="accent-violet-600 h-4 w-4 rounded cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-surface-panel border border-white/[0.08] flex items-center justify-between gap-2">
            <div>
              <span className="font-medium text-white block text-[11px]">Recording Consent Notice</span>
              <span className="text-[10px] text-zinc-400">Plays disclosure at start of call</span>
            </div>
            <input
              type="checkbox"
              checked={recordingConsent}
              onChange={(e) => setRecordingConsent(e.target.checked)}
              className="accent-violet-600 h-4 w-4 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSavingPolicy}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
          >
            {isSavingPolicy ? "Saving Policy..." : "Save Policy Invariants"}
          </Button>
        </div>
      </form>
    );
  }
}