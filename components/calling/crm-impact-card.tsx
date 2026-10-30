"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CallWithRelations } from "@/types/calling";

export interface CrmImpactCardProps {
  call: CallWithRelations;
}

export function CrmImpactCard({ call }: CrmImpactCardProps) {
  const isTerminal = [
    "COMPLETED",
    "FAILED",
    "OPTED_OUT",
    "NO_ANSWER",
    "BUSY",
    "VOICEMAIL",
  ].includes(call.status);

  const hasOutcome = Boolean(call.outcome);
  const isMeeting = call.outcome?.outcome === "MEETING_REQUESTED";
  const isCallback = call.outcome?.outcome === "CALLBACK_REQUESTED";
  const isOptedOut =
    call.outcome?.optOutDetected ||
    call.outcome?.outcome === "OPTED_OUT" ||
    call.status === "OPTED_OUT";

  return (
    <Card variant="standard" className="bg-surface-card border-white/[0.08] relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
      {/* Top hairline reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>CRM &amp; Pipeline Impact</CardTitle>
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08] font-medium">
            Backend Synchronized
          </span>
        </div>
        <CardDescription>
          Authoritative updates recorded to the CRM timeline, lead stage, and follow-up queues.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 1. CRM Activity Log */}
        <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isTerminal ? "bg-[#C6FF33]" : "bg-zinc-600"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">
              CRM Activity Record: <span className="font-mono text-[#C6FF33]">CALL_LOG</span>
            </div>
            <p className="text-zinc-400 font-sans">
              {isTerminal
                ? `Logged under Lead '${call.lead?.businessName || call.leadId}'. Outcome: ${call.outcome?.outcome || call.status}.`
                : "Activity record will be generated automatically when call concludes."}
            </p>
          </div>
        </div>

        {/* 2. Lead Stage Update */}
        <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isOptedOut
                ? "bg-rose-400"
                : isMeeting
                ? "bg-[#C6FF33]"
                : hasOutcome
                ? "bg-violet-400"
                : "bg-zinc-600"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">Pipeline Stage Disposition</div>
            <p className="text-zinc-400 font-sans">
              {isOptedOut
                ? "Stage advanced to: OPT_OUT (Removed from active pipeline)"
                : isMeeting
                ? "Stage advanced to: MEETING_BOOKED"
                : isCallback
                ? "Stage advanced to: IN_FOLLOWUP"
                : isTerminal
                ? "Lead status updated based on conversational qualification."
                : `Current lead status: ${call.lead?.status || "In Outreach"}`}
            </p>
          </div>
        </div>

        {/* 3. Follow-Up Task */}
        <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isMeeting || isCallback ? "bg-violet-400" : "bg-zinc-600"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">Actionable Follow-Up Task</div>
            <p className="text-zinc-400 font-sans">
              {isMeeting
                ? "Demo follow-up scheduled (+1 day SLA) assigned to human reviewer."
                : isCallback
                ? `Prospect callback scheduled at ${call.normalizedPhone} (+2 day SLA).`
                : "No manual follow-up required unless requested by prospect."}
            </p>
          </div>
        </div>

        {/* 4. Suppression Enforcement */}
        <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.06] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isOptedOut ? "bg-rose-500 animate-pulse" : "bg-[#C6FF33]"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">Suppression &amp; Compliance Enclosure</div>
            <p className="text-zinc-400 font-sans">
              {isOptedOut
                ? `Phone ${call.normalizedPhone} permanently registered in Do-Not-Call suppression table.`
                : "Phone verified against workspace Do-Not-Call suppression registry."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
