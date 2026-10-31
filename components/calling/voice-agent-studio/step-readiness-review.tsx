"use client";

import React, { useState } from "react";
import { VoiceAgentStudioConfig, VoiceAgentReadinessReport } from "@/types/voice-agent";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

export interface StepReadinessReviewProps {
  agent: VoiceAgentStudioConfig;
  readinessReport?: VoiceAgentReadinessReport | null;
  onRefreshReadiness: () => Promise<void>;
  onActivationSuccess: (updatedAgent: VoiceAgentStudioConfig) => void;
  onPauseSuccess: (updatedAgent: VoiceAgentStudioConfig) => void;
  isSaving?: boolean;
}

export function StepReadinessReview({
  agent,
  readinessReport,
  onRefreshReadiness,
  onActivationSuccess,
  onPauseSuccess,
  isSaving = false,
}: StepReadinessReviewProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canActivate = readinessReport?.canActivate ?? false;
  const blockers = readinessReport?.blockers || [];
  const checks = readinessReport?.checks || [];

  const handleActivate = async () => {
    if (!agent.id || !canActivate) return;
    setIsActivating(true);
    setActionError(null);
    try {
      const res = await api.voice.activateStudioAgent(agent.id);
      if (res?.data) {
        onActivationSuccess(res.data);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to activate voice agent.");
    } finally {
      setIsActivating(false);
    }
  };

  const handlePause = async () => {
    if (!agent.id) return;
    setIsPausing(true);
    setActionError(null);
    try {
      const res = await api.voice.pauseStudioAgent(agent.id);
      if (res?.data) {
        onPauseSuccess(res.data);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to pause voice agent.");
    } finally {
      setIsPausing(false);
    }
  };

  const isActive = agent.status === "ACTIVE";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Step 11: Pre-Activation Readiness Audit &amp; Lifecycle Gate
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Strict automated readiness gate audit. Activation is blocked until all 10 configuration checks pass and a test call is verified.
          </p>
        </div>

        <Button
          type="button"
          onClick={onRefreshReadiness}
          size="sm"
          disabled={isSaving}
          className="h-8 px-3 text-xs bg-surface-panel hover:bg-surface-elevated text-zinc-300 hover:text-white border border-white/[0.08]"
        >
          ↻ Re-Audit Readiness
        </Button>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/20 text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {/* Main Readiness Gate Card */}
      <div
        className={`rounded-xl border p-5 space-y-4 ${
          isActive
            ? "bg-lime-950/20 border-lime-500/40 shadow-[0_0_16px_rgba(198,255,51,0.15)]"
            : canActivate
            ? "bg-violet-950/20 border-violet-500/50 shadow-[0_0_16px_rgba(125,57,235,0.15)]"
            : "bg-surface-card border-white/[0.08]"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isActive
                    ? "bg-[#C6FF33] animate-pulse"
                    : canActivate
                    ? "bg-violet-400"
                    : "bg-amber-400"
                }`}
              />
              <h4 className="text-sm font-bold text-white tracking-tight">
                {isActive
                  ? "Voice Agent is ACTIVE & Ready for Dispatches"
                  : canActivate
                  ? "Pre-Activation Audit Passed: Ready for Deployment"
                  : "Activation Blocked: Outstanding Readiness Requirements"}
              </h4>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              {isActive
                ? "Agent is currently live, handling assigned carrier calls, and receiving leads."
                : canActivate
                ? "All 10 required configuration gates and diagnostic audio tests are fully verified."
                : `${blockers.length} active blocker(s) must be resolved before this agent can be activated.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isActive ? (
              <Button
                type="button"
                disabled={isPausing}
                onClick={handlePause}
                className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.1] text-xs font-semibold"
              >
                {isPausing ? "Pausing..." : "Pause Agent"}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!canActivate || isActivating || isSaving}
                onClick={handleActivate}
                className={`h-9 px-5 text-xs font-bold shadow-xs transition-all ${
                  canActivate
                    ? "bg-[#C6FF33] hover:bg-[#b0f020] text-black shadow-[0_0_12px_rgba(198,255,51,0.3)] cursor-pointer"
                    : "bg-surface-elevated text-zinc-500 border border-white/[0.08] cursor-not-allowed"
                }`}
              >
                {isActivating ? "Activating Agent..." : "Activate Voice Agent"}
              </Button>
            )}
          </div>
        </div>

        {/* Blockers list */}
        {!canActivate && blockers.length > 0 && (
          <div className="p-3.5 rounded-lg bg-rose-950/25 border border-rose-500/35 space-y-1.5 text-xs">
            <span className="font-semibold text-rose-300 block">
              Active Activation Blockers:
            </span>
            <ul className="space-y-1 text-[11px] text-rose-200/90 font-mono">
              {blockers.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 11-Step Check Matrix */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
          Comprehensive 11-Step Readiness Audit Checklist
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                check.passed
                  ? "bg-surface-panel/60 border-white/[0.06]"
                  : check.required
                  ? "bg-rose-950/15 border-rose-500/30"
                  : "bg-surface-panel/40 border-white/[0.04]"
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    Step {check.stepNumber}
                  </span>
                  <span className="text-white font-semibold truncate">{check.stepName}</span>
                </div>
                {check.details && (
                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2 font-sans">
                    {check.details}
                  </p>
                )}
              </div>

              <div className="shrink-0 mt-0.5">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    check.passed
                      ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/30"
                      : check.required
                      ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {check.passed ? "PASS" : "BLOCK"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
