"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CallOutcome } from "@/types/calling";
import { CallOutcomeBadge } from "./call-outcome-badge";
import { Alert } from "@/components/ui/alert";

export interface CallOutcomeCardProps {
  outcome?: CallOutcome | null;
}

export function CallOutcomeCard({ outcome }: CallOutcomeCardProps) {
  if (!outcome) {
    return (
      <Card variant="standard" className="bg-surface-card border-white/[0.08]">
        <CardHeader>
          <CardTitle>AI Outcome &amp; Intelligence Summary</CardTitle>
          <CardDescription>Post-call conversational analysis and CRM stage disposition.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-xs text-zinc-400 bg-surface-panel rounded-xl border border-white/[0.06] font-mono">
            Outcome analysis will be automatically synthesized by the AI engine upon call completion.
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOptedOut = outcome.optOutDetected || outcome.outcome === "OPTED_OUT" || outcome.outcome === "DO_NOT_CALL";

  return (
    <Card variant="standard" className="bg-surface-card border-white/[0.08] relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
      {/* Top hairline reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>AI Outcome &amp; Conversational Intelligence</CardTitle>
          <CallOutcomeBadge outcome={outcome.outcome} />
        </div>
        <CardDescription>
          Derived strictly from transcript facts and prospect responses without fabrication.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Visible Compliance Alert for Opt-Outs */}
        {isOptedOut && (
          <Alert variant="destructive" title="Compliance Alert: Prospect Opt-Out Detected">
            The prospect requested to be removed from future outreach during this conversation. Phone suppression was automatically registered and the CRM lead stage transitioned to OPT_OUT.
          </Alert>
        )}

        {/* Executive Summary */}
        <div className="p-4 rounded-xl bg-surface-panel border border-white/[0.08] space-y-1">
          <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider">
            Executive Summary
          </div>
          <p className="text-xs text-white leading-relaxed font-sans">{outcome.summary}</p>
        </div>

        {/* Structured Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06]">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
              Interest Level
            </span>
            <span className="font-semibold text-white capitalize font-mono text-sm">{outcome.interestLevel || "Unknown"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06]">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
              Prospect Sentiment
            </span>
            <span className="font-semibold text-white capitalize font-mono text-sm">{outcome.sentiment || "Neutral"}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06]">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block mb-1">
              Next Action
            </span>
            <span className="font-semibold text-[#C6FF33] font-mono text-sm">{outcome.nextAction || "None"}</span>
          </div>
        </div>

        {/* Requested Follow-Up */}
        {outcome.requestedFollowUp && (
          <div className="p-3.5 rounded-xl bg-surface-panel border border-violet-500/30 text-xs">
            <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider block mb-1 font-mono">
              Requested Follow-Up
            </span>
            <p className="text-white font-sans">{outcome.requestedFollowUp}</p>
          </div>
        )}

        {/* Objections Identified */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase font-mono tracking-wider block">
            Objections Identified
          </span>
          {outcome.objections && outcome.objections.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {outcome.objections.map((obj, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-lg bg-surface-elevated border border-white/[0.08] text-zinc-200 font-sans"
                >
                  {obj}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 font-mono">No explicit objections recorded.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
