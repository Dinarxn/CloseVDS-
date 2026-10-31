"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface StepPersonaPromptProps {
  name: string;
  onNameChange: (val: string) => void;
  speakingStyle: string;
  onSpeakingStyleChange: (val: string) => void;
  callObjective: string;
  onCallObjectiveChange: (val: string) => void;
  openingScript: string;
  onOpeningScriptChange: (val: string) => void;
  agentPersona: string;
  onAgentPersonaChange: (val: string) => void;
  onApplyPreset?: (preset: "english" | "hindi") => void;
}

const DYNAMIC_VARIABLES = [
  { tag: "{{businessName}}", label: "Business Name" },
  { tag: "{{contactName}}", label: "Decision Maker" },
  { tag: "{{niche}}", label: "Industry / Niche" },
  { tag: "{{observedGaps}}", label: "Technical Gaps" },
  { tag: "{{city}}", label: "City / Market" },
];

export function StepPersonaPrompt({
  name,
  onNameChange,
  speakingStyle,
  onSpeakingStyleChange,
  callObjective,
  onCallObjectiveChange,
  openingScript,
  onOpeningScriptChange,
  agentPersona,
  onAgentPersonaChange,
  onApplyPreset,
}: StepPersonaPromptProps) {
  const objectiveLength = callObjective.trim().length;
  const isPromptValid = objectiveLength > 50;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Step 4: Conversational Persona &amp; System Prompt
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Define who the agent represents, the conversational goal, and the opening 10-second hook.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onApplyPreset?.("english")}
            className="h-7 px-3 text-xs rounded-lg font-mono bg-surface-panel hover:bg-surface-elevated text-zinc-300 hover:text-white border border-white/[0.08] hover:border-violet-500/40 transition-colors"
          >
            Apply English Preset (Alex)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset?.("hindi")}
            className="h-7 px-3 text-xs rounded-lg font-mono bg-surface-panel hover:bg-surface-elevated text-zinc-300 hover:text-white border border-white/[0.08] hover:border-violet-500/40 transition-colors"
          >
            Apply Hindi Preset (Rajesh)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white">Agent Name</label>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Alex - Senior Growth Advisor"
            className="bg-surface-panel border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-violet-500"
          />
        </div>

        {/* Speaking Style */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white">Speaking Style &amp; Cadence</label>
          <Input
            value={speakingStyle}
            onChange={(e) => onSpeakingStyleChange(e.target.value)}
            placeholder="e.g. Empathetic, direct, consultative, respectful"
            className="bg-surface-panel border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-violet-500"
          />
        </div>
      </div>

      {/* Agent Persona Narrative */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white">
          Agent Persona &amp; Organizational Role
        </label>
        <Input
          value={agentPersona}
          onChange={(e) => onAgentPersonaChange(e.target.value)}
          placeholder="e.g. Senior acquisition consultant representing CloseVDS with 7+ years advising clinics"
          className="bg-surface-panel border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-violet-500"
        />
      </div>

      {/* Opening Script Hook */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white">
            Opening Script Hook (First 10 Seconds)
          </label>
          <span className="text-[10px] font-mono text-zinc-500">Delivered immediately upon call answer</span>
        </div>
        <Textarea
          rows={3}
          value={openingScript}
          onChange={(e) => onOpeningScriptChange(e.target.value)}
          placeholder="Hi, this is Alex reaching out regarding your online patient intake workflow. Do you have two minutes to speak with the practice manager?"
          className="bg-surface-panel border-white/[0.08] text-white placeholder:text-zinc-600 focus:border-violet-500 leading-relaxed text-xs"
        />
      </div>

      {/* System Prompt / Call Objective */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white">
            System Prompt &amp; Conversational Objective (Hard Gate: &gt; 50 Characters)
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isPromptValid
                  ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/30"
                  : "bg-rose-500/15 text-rose-300 border-rose-500/40"
              }`}
            >
              {objectiveLength} / 51 chars min {isPromptValid ? "✓ Passed" : "✗ Blocker"}
            </span>
          </div>
        </div>

        <Textarea
          rows={5}
          value={callObjective}
          onChange={(e) => onCallObjectiveChange(e.target.value)}
          placeholder="Introduce CloseVDS client acquisition capabilities, qualify prospective business fit, identify current booking bottlenecks, and secure a 15-minute technical audit walkthrough demo with the decision maker."
          className={`bg-surface-panel border text-white placeholder:text-zinc-600 leading-relaxed text-xs ${
            isPromptValid
              ? "border-white/[0.08] focus:border-violet-500"
              : "border-rose-500/50 focus:border-rose-500"
          }`}
        />

        {!isPromptValid && (
          <p className="text-[11px] text-rose-400 font-mono mt-1">
            ⚠ System Prompt is currently {objectiveLength} characters. Activation is blocked by the backend readiness gate until objective exceeds 50 characters.
          </p>
        )}
      </div>

      {/* Dynamic Lead Variables Bar */}
      <div className="p-3.5 rounded-xl border border-white/[0.08] bg-surface-card space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
          Available Dynamic Lead Variable Tags
        </span>
        <div className="flex flex-wrap gap-2">
          {DYNAMIC_VARIABLES.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => onCallObjectiveChange(callObjective + " " + v.tag)}
              className="text-xs font-mono px-2 py-1 rounded-md bg-surface-panel border border-white/[0.06] hover:border-violet-500/50 text-violet-300 hover:text-white transition-colors cursor-pointer"
            >
              {v.tag} <span className="text-zinc-500 font-sans text-[11px]">({v.label})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
