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
      <Card variant="standard">
        <CardHeader>
          <CardTitle>AI Outcome &amp; Intelligence Summary</CardTitle>
          <CardDescription>Post-call conversational analysis and CRM stage disposition.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-xs text-[#737373] bg-[#0a0a0a] rounded-lg border border-[#404040]/50">
            Outcome analysis will be automatically synthesized by the AI engine upon call completion.
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOptedOut = outcome.optOutDetected || outcome.outcome === "OPTED_OUT" || outcome.outcome === "DO_NOT_CALL";

  return (
    <Card variant="standard">
      <CardHeader>
        <div className="flex items-center justify-between">
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
        <div className="p-3.5 rounded-lg bg-[#0a0a0a] border border-[#404040]">
          <div className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider mb-1">
            Executive Summary
          </div>
          <p className="text-xs text-white leading-relaxed">{outcome.summary}</p>
        </div>

        {/* Structured Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040]">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
              Interest Level
            </span>
            <span className="font-semibold text-white capitalize">{outcome.interestLevel || "Unknown"}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040]">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
              Prospect Sentiment
            </span>
            <span className="font-semibold text-white capitalize">{outcome.sentiment || "Neutral"}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040]">
            <span className="text-[10px] text-[#737373] uppercase tracking-wider block mb-1">
              Next Action
            </span>
            <span className="font-semibold text-emerald-300">{outcome.nextAction || "None"}</span>
          </div>
        </div>

        {/* Requested Follow-Up */}
        {outcome.requestedFollowUp && (
          <div className="p-3 rounded-lg bg-[#0a0a0a] border border-cyan-900/60 text-xs">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block mb-1">
              Requested Follow-Up
            </span>
            <p className="text-white">{outcome.requestedFollowUp}</p>
          </div>
        )}

        {/* Objections Identified */}
        <div>
          <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider block mb-2">
            Objections Identified
          </span>
          {outcome.objections && outcome.objections.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {outcome.objections.map((obj, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-md bg-[#171717] border border-[#404040] text-[#d4d4d4]"
                >
                  {obj}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#737373]">No explicit objections recorded.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
