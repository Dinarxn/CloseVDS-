"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface StepKnowledgeBaseProps {
  approvedTalkingPoints: string[];
  onApprovedTalkingPointsChange: (points: string[]) => void;
  prohibitedClaims: string[];
  onProhibitedClaimsChange: (claims: string[]) => void;
}

export function StepKnowledgeBase({
  approvedTalkingPoints,
  onApprovedTalkingPointsChange,
  prohibitedClaims,
  onProhibitedClaimsChange,
}: StepKnowledgeBaseProps) {
  const [newPoint, setNewPoint] = useState("");
  const [newProhibited, setNewProhibited] = useState("");

  const handleAddPoint = () => {
    if (!newPoint.trim()) return;
    onApprovedTalkingPointsChange([...approvedTalkingPoints, newPoint.trim()]);
    setNewPoint("");
  };

  const handleRemovePoint = (index: number) => {
    onApprovedTalkingPointsChange(approvedTalkingPoints.filter((_, i) => i !== index));
  };

  const handleAddProhibited = () => {
    if (!newProhibited.trim()) return;
    onProhibitedClaimsChange([...prohibitedClaims, newProhibited.trim()]);
    setNewProhibited("");
  };

  const handleRemoveProhibited = (index: number) => {
    onProhibitedClaimsChange(prohibitedClaims.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Step 5: Knowledge Base &amp; Factual Grounding Boundaries
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Specify what facts the voice agent is authorized to discuss, and explicitly prohibit unverified assertions to eliminate AI hallucinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approved Talking Points */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6FF33]" />
              <h4 className="text-sm font-semibold text-white">Approved Talking Points</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#C6FF33] px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/25">
              {approvedTalkingPoints.length} Points
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Factual statements, verified performance statistics, and approved product capabilities.
          </p>

          {/* Add input */}
          <div className="flex items-center gap-2">
            <Input
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddPoint();
                }
              }}
              placeholder="e.g. Automated booking integration without staff overhead"
              className="bg-surface-panel border-white/[0.08] text-white text-xs placeholder:text-zinc-600"
            />
            <Button
              type="button"
              onClick={handleAddPoint}
              size="sm"
              className="h-9 px-3 bg-violet-600 hover:bg-violet-500 text-white shrink-0 text-xs"
            >
              Add Point
            </Button>
          </div>

          {/* List of points */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {approvedTalkingPoints.map((point, index) => (
              <div
                key={index}
                className="p-2.5 rounded-lg bg-surface-panel border border-white/[0.06] flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[#C6FF33] font-bold mt-0.5 text-xs">✓</span>
                  <span className="text-zinc-200 leading-snug">{point}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePoint(index)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited Claims / Anti-Hallucination Guardrails */}
        <div className="rounded-xl border border-rose-500/25 bg-surface-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h4 className="text-sm font-semibold text-white">Prohibited Claims (Boundaries)</h4>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/25">
              {prohibitedClaims.length} Prohibitions
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            Rules the AI agent is strictly barred from stating or promising under any circumstance.
          </p>

          {/* Add input */}
          <div className="flex items-center gap-2">
            <Input
              value={newProhibited}
              onChange={(e) => setNewProhibited(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProhibited();
                }
              }}
              placeholder="e.g. Never guarantee 100% revenue increases"
              className="bg-surface-panel border-white/[0.08] text-white text-xs placeholder:text-zinc-600"
            />
            <Button
              type="button"
              onClick={handleAddProhibited}
              size="sm"
              className="h-9 px-3 bg-rose-700 hover:bg-rose-600 text-white shrink-0 text-xs"
            >
              Add Rule
            </Button>
          </div>

          {/* List of prohibited claims */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {prohibitedClaims.map((claim, index) => (
              <div
                key={index}
                className="p-2.5 rounded-lg bg-surface-panel border border-rose-500/20 flex items-start justify-between gap-2 text-xs"
              >
                <div className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold mt-0.5 text-xs">⛔</span>
                  <span className="text-zinc-200 leading-snug">{claim}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProhibited(index)}
                  className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
