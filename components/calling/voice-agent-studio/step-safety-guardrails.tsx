"use client";

import React, { useState } from "react";
import { VoiceAgentSafetyGuardrails } from "@/types/voice-agent";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface StepSafetyGuardrailsProps {
  safety: VoiceAgentSafetyGuardrails;
  onSafetyChange: (safety: VoiceAgentSafetyGuardrails) => void;
  escalationConditions: string[];
  onEscalationConditionsChange: (conditions: string[]) => void;
  fallbackBehavior?: string;
  onFallbackBehaviorChange?: (fallback: string) => void;
}

export function StepSafetyGuardrails({
  safety,
  onSafetyChange,
  escalationConditions,
  onEscalationConditionsChange,
  fallbackBehavior = "",
  onFallbackBehaviorChange,
}: StepSafetyGuardrailsProps) {
  const [newOptOut, setNewOptOut] = useState("");
  const [newEscalation, setNewEscalation] = useState("");

  const handleAddOptOut = () => {
    if (!newOptOut.trim()) return;
    const current = safety.optOutKeywords || [];
    onSafetyChange({
      ...safety,
      optOutKeywords: [...current, newOptOut.trim().toLowerCase()],
    });
    setNewOptOut("");
  };

  const handleRemoveOptOut = (index: number) => {
    const current = safety.optOutKeywords || [];
    onSafetyChange({
      ...safety,
      optOutKeywords: current.filter((_, i) => i !== index),
    });
  };

  const handleAddEscalation = () => {
    if (!newEscalation.trim()) return;
    onEscalationConditionsChange([...escalationConditions, newEscalation.trim()]);
    setNewEscalation("");
  };

  const handleRemoveEscalation = (index: number) => {
    onEscalationConditionsChange(escalationConditions.filter((_, i) => i !== index));
  };

  const durationValid = safety.maxDurationSeconds >= 30 && safety.maxDurationSeconds <= 1800;
  const hasGuardrails = Boolean((safety.optOutKeywords?.length || 0) > 0 || escalationConditions.length > 0);
  const stepPassed = durationValid && hasGuardrails;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Step 9: Safety Guardrails &amp; Human Governance (Hard Gate: Active Rules)
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Configure automated compliance limits, instant opt-out detection, calling windows, and human supervisor escalation triggers.
          </p>
        </div>

        <span
          className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold border shrink-0 ${
            stepPassed
              ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/30"
              : "bg-rose-500/15 text-rose-300 border-rose-500/40"
          }`}
        >
          {stepPassed ? "✓ Safety Audit Passed" : "✗ Safety Incomplete"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Call Duration Limit */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Max Call Duration</span>
              <span className="text-[11px] text-zinc-400">
                Automatic termination threshold (Must be between 30s and 1800s).
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-surface-panel border border-white/[0.08]">
              {Math.floor(safety.maxDurationSeconds / 60)}m {safety.maxDurationSeconds % 60}s
            </span>
          </div>

          <input
            type="range"
            min="30"
            max="1800"
            step="30"
            value={safety.maxDurationSeconds}
            onChange={(e) =>
              onSafetyChange({ ...safety, maxDurationSeconds: parseInt(e.target.value, 10) })
            }
            className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>30s min</span>
            <span>300s (5 min default)</span>
            <span>1800s (30 min max)</span>
          </div>
        </div>

        {/* Permissible Calling Window */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div>
            <span className="text-xs font-semibold text-white block">Permissible Calling Window</span>
            <span className="text-[11px] text-zinc-400">
              Calls are automatically suppressed outside recipient local business hours.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Earliest Start</label>
              <Input
                type="time"
                value={safety.callingWindowStart || "09:00"}
                onChange={(e) =>
                  onSafetyChange({ ...safety, callingWindowStart: e.target.value })
                }
                className="bg-surface-panel border-white/[0.08] text-white text-xs h-8.5"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 uppercase">Latest Cutoff</label>
              <Input
                type="time"
                value={safety.callingWindowEnd || "18:00"}
                onChange={(e) =>
                  onSafetyChange({ ...safety, callingWindowEnd: e.target.value })
                }
                className="bg-surface-panel border-white/[0.08] text-white text-xs h-8.5"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Opt-Out Keywords */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white block">
              Opt-Out Trigger Keywords (Instant Suppression)
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {safety.optOutKeywords?.length || 0} Triggers
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={newOptOut}
              onChange={(e) => setNewOptOut(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOptOut();
                }
              }}
              placeholder="e.g. stop calling, do not call, remove me"
              className="bg-surface-panel border-white/[0.08] text-white text-xs"
            />
            <button
              type="button"
              onClick={handleAddOptOut}
              className="h-8.5 px-3 text-xs rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold shrink-0 cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {safety.optOutKeywords?.map((kw, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-panel text-zinc-300 border border-white/[0.06] flex items-center gap-1.5"
              >
                <span>&quot;{kw}&quot;</span>
                <button
                  type="button"
                  onClick={() => handleRemoveOptOut(idx)}
                  className="text-zinc-500 hover:text-rose-400"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Escalation Conditions */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white block">
              Human Escalation Rules
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {escalationConditions.length} Rules
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={newEscalation}
              onChange={(e) => setNewEscalation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEscalation();
                }
              }}
              placeholder="e.g. Prospect requests human manager"
              className="bg-surface-panel border-white/[0.08] text-white text-xs"
            />
            <button
              type="button"
              onClick={handleAddEscalation}
              className="h-8.5 px-3 text-xs rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold shrink-0 cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {escalationConditions.map((cond, idx) => (
              <div
                key={idx}
                className="p-1.5 rounded bg-surface-panel border border-white/[0.06] flex items-center justify-between gap-2 text-xs"
              >
                <span className="text-zinc-300 truncate">{cond}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEscalation(idx)}
                  className="text-zinc-500 hover:text-rose-400 p-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fallback Behavior */}
      <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-2">
        <label className="text-xs font-semibold text-white block">
          Fallback Behavior on Connection Drop or Unrecoverable Confusion
        </label>
        <Textarea
          rows={2}
          value={fallbackBehavior}
          onChange={(e) => onFallbackBehaviorChange?.(e.target.value)}
          placeholder="e.g. Apologize politely, state that the line seems noisy, confirm you will send the scheduled demo confirmation link by SMS, and terminate call cleanly."
          className="bg-surface-panel border-white/[0.08] text-white text-xs leading-relaxed"
        />
      </div>
    </div>
  );
}
