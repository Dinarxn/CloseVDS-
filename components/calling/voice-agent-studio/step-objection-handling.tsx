"use client";

import React, { useState } from "react";
import { ObjectionHandlingRule } from "@/types/voice-agent";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface StepObjectionHandlingProps {
  objectionRules: ObjectionHandlingRule[];
  onObjectionRulesChange: (rules: ObjectionHandlingRule[]) => void;
}

const PRESET_OBJECTIONS: ObjectionHandlingRule[] = [
  {
    id: "obj-price",
    category: "Price & Budget",
    triggerPhrases: ["too expensive", "no budget right now", "cost is too high", "how much is this"],
    responseGuidance: "Acknowledge cost sensitivity directly. Clarify that CloseVDS requires zero upfront software overhaul and our demonstration simply measures currently leaked patient bookings without commercial commitment.",
    priority: 8,
  },
  {
    id: "obj-competitor",
    category: "Existing Vendor / Competitor",
    triggerPhrases: ["already have an agency", "we use someone else", "we have an in-house person"],
    responseGuidance: "Validate their existing partner. Explain that we do not replace existing marketing agencies; rather, we provide automated real-time phone reception and booking capture that plugs directly into existing calendars.",
    priority: 7,
  },
  {
    id: "obj-timing",
    category: "Timing / Busy",
    triggerPhrases: ["too busy right now", "call back next quarter", "bad time", "in the middle of clinic"],
    responseGuidance: "Respect their time instantly. Offer to send a 2-minute video recap or schedule a brief 10-minute slot outside clinic operational hours.",
    priority: 9,
  },
  {
    id: "obj-send-email",
    category: "Brush-Off / Send Info",
    triggerPhrases: ["just send me an email", "put it in writing", "send info to info@"],
    responseGuidance: "Agree cheerfully, confirm their exact personal email address, and ask one quick qualifying question so the sent audit report addresses their specific booking bottleneck.",
    priority: 6,
  },
];

export function StepObjectionHandling({
  objectionRules,
  onObjectionRulesChange,
}: StepObjectionHandlingProps) {
  const [category, setCategory] = useState("Price & Budget");
  const [triggerPhrase, setTriggerPhrase] = useState("");
  const [responseGuidance, setResponseGuidance] = useState("");
  const [priority, setPriority] = useState(7);

  const handleAddRule = () => {
    if (!triggerPhrase.trim() || !responseGuidance.trim()) return;

    const phrases = triggerPhrase
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const newRule: ObjectionHandlingRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      category,
      triggerPhrases: phrases,
      responseGuidance: responseGuidance.trim(),
      priority,
    };

    onObjectionRulesChange([...objectionRules, newRule]);
    setTriggerPhrase("");
    setResponseGuidance("");
  };

  const handleRemoveRule = (id: string) => {
    onObjectionRulesChange(objectionRules.filter((r) => r.id !== id));
  };

  const handleApplyPresets = () => {
    onObjectionRulesChange(PRESET_OBJECTIONS);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">
            Step 6: Dynamic Objection Handling Rules
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Equip the agent with real-time conversational counter-moves when prospects raise budget, timing, or competitor objections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyPresets}
          className="h-7 px-3 text-xs rounded-lg font-mono bg-surface-panel hover:bg-surface-elevated text-zinc-300 hover:text-white border border-white/[0.08] hover:border-violet-500/40 transition-colors shrink-0"
        >
          Load Standard Sales Presets
        </button>
      </div>

      {/* New Rule Form */}
      <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 sm:p-5 space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          Add New Objection Handling Rule
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white">Objection Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 rounded-md bg-surface-panel border border-white/[0.08] text-white text-xs px-3 focus:outline-none focus:border-violet-500"
            >
              <option value="Price & Budget">Price &amp; Budget</option>
              <option value="Existing Vendor / Competitor">Existing Vendor / Competitor</option>
              <option value="Timing / Busy">Timing / Busy</option>
              <option value="Brush-Off / Send Info">Brush-Off / Send Info</option>
              <option value="Authority / Gatekeeper">Authority / Gatekeeper</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-white">
              Trigger Phrases (Comma-separated)
            </label>
            <Input
              value={triggerPhrase}
              onChange={(e) => setTriggerPhrase(e.target.value)}
              placeholder="e.g. too expensive, no budget, cost is too high"
              className="bg-surface-panel border-white/[0.08] text-white text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white">
              AI Counter-Response Guidance
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-500">Priority (1-10):</span>
              <input
                type="number"
                min="1"
                max="10"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 5)}
                className="w-12 h-6 text-xs text-center rounded bg-surface-panel border border-white/[0.08] text-white"
              />
            </div>
          </div>
          <Textarea
            rows={3}
            value={responseGuidance}
            onChange={(e) => setResponseGuidance(e.target.value)}
            placeholder="Acknowledge the objection respectfully, emphasize that our audit requires zero upfront capital, and pivot back to identifying their primary patient booking bottleneck."
            className="bg-surface-panel border-white/[0.08] text-white text-xs leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleAddRule}
            size="sm"
            className="h-8.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
          >
            Add Objection Rule
          </Button>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Configured Objection Playbook ({objectionRules.length} Rules Active)
          </span>
        </div>

        {objectionRules.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-white/[0.06] bg-surface-card text-zinc-500 text-xs font-mono">
            No objection rules configured yet. Click &quot;Load Standard Sales Presets&quot; above to initialize.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objectionRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-surface-panel border border-white/[0.08] space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-violet-300 border border-violet-500/30">
                      {rule.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Priority {rule.priority}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Triggers</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.triggerPhrases.map((phrase, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-white/[0.05]"
                        >
                          &quot;{phrase}&quot;
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Guidance</span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {rule.responseGuidance}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(rule.id)}
                    className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    Delete Rule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
