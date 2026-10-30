"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { WorkspaceCallingPolicy, UpdateCallingPolicyInput } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface CallingPolicyCardProps {
  policy: WorkspaceCallingPolicy | null;
  isLoading?: boolean;
  onPolicyUpdated?: () => void;
}

export function CallingPolicyCard({
  policy,
  isLoading = false,
  onPolicyUpdated,
}: CallingPolicyCardProps) {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [humanApprovalRequired, setHumanApprovalRequired] = useState<boolean>(true);
  const [dailyCallLimit, setDailyCallLimit] = useState<number>(25);
  const [maxAttemptsPerLead, setMaxAttemptsPerLead] = useState<number>(3);
  const [retryDelayMinutes, setRetryDelayMinutes] = useState<number>(120);
  const [callingWindowStart, setCallingWindowStart] = useState<string>("09:00");
  const [callingWindowEnd, setCallingWindowEnd] = useState<string>("17:00");
  const [recordingConsent, setRecordingConsent] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (policy) {
      setIsActive(policy.isActive);
      setHumanApprovalRequired(policy.humanApprovalRequired);
      setDailyCallLimit(policy.dailyCallLimit);
      setMaxAttemptsPerLead(policy.maxAttemptsPerLead);
      setRetryDelayMinutes(policy.retryDelayMinutes);
      setCallingWindowStart(policy.callingWindowStart || "09:00");
      setCallingWindowEnd(policy.callingWindowEnd || "17:00");
      setRecordingConsent(policy.recordingConsent);
    }
  }, [policy]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    // Validate 24h time format HH:MM
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(callingWindowStart)) {
      setErrorMsg("Calling window start must be in HH:MM 24-hour format (e.g., 09:00).");
      setIsSaving(false);
      return;
    }
    if (!timeRegex.test(callingWindowEnd)) {
      setErrorMsg("Calling window end must be in HH:MM 24-hour format (e.g., 17:00).");
      setIsSaving(false);
      return;
    }

    const payload: UpdateCallingPolicyInput = {
      isActive,
      humanApprovalRequired,
      dailyCallLimit: Number(dailyCallLimit),
      maxAttemptsPerLead: Number(maxAttemptsPerLead),
      retryDelayMinutes: Number(retryDelayMinutes),
      callingWindowStart,
      callingWindowEnd,
      recordingConsent,
    };

    try {
      await api.voice.updatePolicy(payload);
      addToast({
        title: "Calling Policy Saved",
        description: "Workspace voice outreach guardrails and automation rules updated.",
        variant: "success",
      });
      onPolicyUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to update calling policy.";
      setErrorMsg(msg);
      addToast({
        title: "Update Failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleKillSwitch = async () => {
    const nextState = !isActive;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await api.voice.updatePolicy({ isActive: nextState });
      setIsActive(nextState);
      addToast({
        title: nextState ? "Calling Engine Active" : "Emergency Kill-Switch Active",
        description: nextState
          ? "Outbound calling workflows resumed."
          : "All outbound voice calls are paused immediately by server safety gates.",
        variant: nextState ? "success" : "warning",
      });
      onPolicyUpdated?.();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to toggle kill switch.";
      setErrorMsg(msg);
      addToast({
        title: "Action Failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card variant="standard" className="bg-surface-card border-white/[0.08]">
        <CardContent className="p-8 text-center text-xs text-zinc-400 font-mono animate-pulse">
          Loading workspace calling policy...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="standard" className="relative overflow-hidden bg-surface-card border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Autonomous Safety &amp; Guardrails
              </span>
              <span className="text-zinc-600 font-mono text-[10px]">•</span>
              <span
                className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  isActive
                    ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/25"
                    : "bg-rose-500/15 text-rose-300 border-rose-500/35"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#C6FF33]" : "bg-rose-500"}`} />
                {isActive ? "ENGINE ACTIVE" : "KILL-SWITCH ENGAGED"}
              </span>
            </div>
            <CardTitle className="text-base text-white mt-1">Workspace Calling Policy &amp; Automation</CardTitle>
            <CardDescription className="text-xs text-zinc-400 font-sans">
              Configure daily call volume limits, mandatory human verification, legal calling windows, and emergency safety controls.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant={isActive ? "destructive" : "primary"}
            size="sm"
            onClick={handleToggleKillSwitch}
            disabled={isSaving}
            className={`text-xs font-semibold shrink-0 h-8.5 ${
              isActive ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-[#7D39EB] hover:bg-[#6C2FD1] text-white"
            }`}
          >
            {isActive ? "Pause Calling (Kill-Switch)" : "Resume Calling Engine"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {errorMsg && (
          <Alert variant="destructive" title="Policy Validation Error">
            {errorMsg}
          </Alert>
        )}

        {!isActive && (
          <Alert variant="warning" title="Global Calling Kill-Switch is Active">
            Outbound voice outreach is halted across all campaigns. Preparing or dispatching new calls is blocked by backend safety gates until calling is resumed.
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              id="policy-daily-limit"
              label="Daily Call Limit (1-500)"
              type="number"
              min={1}
              max={500}
              value={dailyCallLimit}
              onChange={(e) => setDailyCallLimit(Number(e.target.value))}
              helperText="Hard stop per calendar day across workspace."
              required
            />

            <Input
              id="policy-max-attempts"
              label="Max Attempts per Prospect"
              type="number"
              min={1}
              max={20}
              value={maxAttemptsPerLead}
              onChange={(e) => setMaxAttemptsPerLead(Number(e.target.value))}
              helperText="Safety threshold before prospect is suppressed."
              required
            />

            <Input
              id="policy-retry-delay"
              label="Retry Delay (Minutes)"
              type="number"
              min={5}
              max={10080}
              value={retryDelayMinutes}
              onChange={(e) => setRetryDelayMinutes(Number(e.target.value))}
              helperText="Cooldown between consecutive attempts (min: 5m)."
              required
            />

            <Input
              id="policy-window-start"
              label="Calling Window Start (24h)"
              type="text"
              placeholder="09:00"
              value={callingWindowStart}
              onChange={(e) => setCallingWindowStart(e.target.value)}
              helperText="Format: HH:MM (e.g. 09:00 local time)"
              required
            />

            <Input
              id="policy-window-end"
              label="Calling Window End (24h)"
              type="text"
              placeholder="17:00"
              value={callingWindowEnd}
              onChange={(e) => setCallingWindowEnd(e.target.value)}
              helperText="Format: HH:MM (e.g. 17:00 local time)"
              required
            />

            <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex flex-col justify-center space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={humanApprovalRequired}
                  onChange={(e) => setHumanApprovalRequired(e.target.checked)}
                  className="rounded border-zinc-700 bg-surface-input text-[#7D39EB] focus:ring-[#7D39EB]"
                />
                <span className="text-xs font-semibold text-white font-sans">Human Approval Gate</span>
              </label>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                Requires operator approval before any prepared call can be initiated.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex items-start gap-3">
            <input
              type="checkbox"
              id="policy-recording-consent"
              checked={recordingConsent}
              onChange={(e) => setRecordingConsent(e.target.checked)}
              className="mt-0.5 rounded border-zinc-700 bg-surface-input text-[#7D39EB] focus:ring-[#7D39EB]"
            />
            <label htmlFor="policy-recording-consent" className="cursor-pointer space-y-0.5">
              <span className="text-xs font-semibold text-white block font-sans">Call Recording Consent Playback</span>
              <span className="text-[11px] text-zinc-400 block leading-relaxed font-sans">
                When enabled, the voice agent will announce call recording disclosure at the beginning of the call in compliance with applicable telecommunications recording regulations.
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              className="px-4 text-xs font-semibold bg-[#7D39EB] hover:bg-[#6C2FD1] text-white shadow-xs h-8.5"
            >
              {isSaving ? "Saving Policy..." : "Save Calling Policy"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}