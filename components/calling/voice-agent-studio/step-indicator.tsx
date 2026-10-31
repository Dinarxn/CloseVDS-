"use client";

import React from "react";
import { VoiceAgentLifecycleStatus } from "@/types/voice-agent";

export interface StepItem {
  number: number;
  id: string;
  title: string;
  shortLabel: string;
  description: string;
}

export const STUDIO_STEPS: StepItem[] = [
  { number: 1, id: "provider", title: "Provider Engine", shortLabel: "Provider", description: "Select AI voice provider" },
  { number: 2, id: "model", title: "Model Configuration", shortLabel: "Model", description: "Select LLM & temperature" },
  { number: 3, id: "voice", title: "Voice & Audio", shortLabel: "Voice", description: "Acoustic timbre & latency" },
  { number: 4, id: "persona", title: "Persona & Prompt", shortLabel: "Prompt", description: "System prompt & persona" },
  { number: 5, id: "knowledge", title: "Knowledge Base", shortLabel: "Knowledge", description: "Approved points & boundaries" },
  { number: 6, id: "objections", title: "Objection Handling", shortLabel: "Objections", description: "Trigger phrases & responses" },
  { number: 7, id: "qualification", title: "Qualification", shortLabel: "Qualify", description: "Mandatory qualification criteria" },
  { number: 8, id: "phone", title: "Phone Number", shortLabel: "Number", description: "Carrier line & compatibility" },
  { number: 9, id: "safety", title: "Safety & Guardrails", shortLabel: "Safety", description: "DNC, caps & kill switches" },
  { number: 10, id: "test", title: "Diagnostic Test", shortLabel: "Test Call", description: "Run test & verify audio" },
  { number: 11, id: "readiness", title: "Readiness & Activation", shortLabel: "Activate", description: "Pre-activation audit gate" },
];

export interface StepIndicatorProps {
  currentStep: number;
  onStepSelect: (step: number) => void;
  completedSteps: Set<number>;
  agentStatus?: VoiceAgentLifecycleStatus;
  hasErrors?: Record<number, boolean>;
}

export function StepIndicator({
  currentStep,
  onStepSelect,
  completedSteps,
  agentStatus = "DRAFT",
  hasErrors = {},
}: StepIndicatorProps) {
  return (
    <div className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3 sm:p-4 shadow-sm overflow-hidden relative">
      {/* Top subtle reflection line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent pointer-events-none" />

      {/* Header status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            11-Step Voice Agent Studio
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">•</span>
          <span className="text-xs font-semibold text-white">
            Step {currentStep} of 11: {STUDIO_STEPS[currentStep - 1]?.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-400">Lifecycle Status:</span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
              agentStatus === "ACTIVE"
                ? "bg-[#C6FF33]/15 text-[#C6FF33] border-lime-500/30 shadow-[0_0_8px_rgba(198,255,51,0.2)]"
                : agentStatus === "TESTED"
                ? "bg-violet-950/40 text-violet-300 border-violet-500/40"
                : agentStatus === "READY_FOR_TEST"
                ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                : agentStatus === "PAUSED"
                ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                : agentStatus === "ERROR"
                ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                : "bg-surface-elevated text-zinc-400 border-white/[0.08]"
            }`}
          >
            {agentStatus}
          </span>
        </div>
      </div>

      {/* Horizontal step flow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-1.5 sm:gap-2">
        {STUDIO_STEPS.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = completedSteps.has(step.number);
          const hasError = hasErrors[step.number];

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepSelect(step.number)}
              className={`group flex flex-col items-start p-2 rounded-lg text-left transition-all border relative cursor-pointer ${
                isActive
                  ? "bg-violet-950/40 border-violet-500/80 shadow-[0_0_12px_rgba(125,57,235,0.25)]"
                  : isCompleted
                  ? "bg-lime-950/20 border-lime-500/30 hover:border-lime-500/50"
                  : hasError
                  ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60"
                  : "bg-surface-panel/40 border-white/[0.05] hover:border-white/[0.15] hover:bg-surface-panel/80"
              }`}
            >
              {/* Step number badge */}
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isActive
                      ? "bg-violet-500 text-white"
                      : isCompleted
                      ? "bg-[#C6FF33] text-black"
                      : hasError
                      ? "bg-rose-500 text-white"
                      : "bg-surface-elevated text-zinc-400 border border-white/[0.08]"
                  }`}
                >
                  {isCompleted && !isActive ? "✓" : step.number < 10 ? `0${step.number}` : step.number}
                </span>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                )}
                {isCompleted && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
                )}
              </div>

              {/* Title & summary */}
              <span
                className={`text-[11px] font-semibold tracking-tight truncate w-full ${
                  isActive
                    ? "text-white"
                    : isCompleted
                    ? "text-lime-200"
                    : hasError
                    ? "text-rose-300"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                {step.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
