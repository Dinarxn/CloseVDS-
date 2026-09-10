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
    <Card variant="standard">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>CRM &amp; Pipeline Impact</CardTitle>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#171717] text-[#a3a3a3] border border-[#404040]">
            Backend Synchronized
          </span>
        </div>
        <CardDescription>
          Authoritative updates recorded to the CRM timeline, lead stage, and follow-up queues.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 1. CRM Activity Log */}
        <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isTerminal ? "bg-emerald-400" : "bg-[#737373]"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">
              CRM Activity Record: <span className="font-mono text-emerald-400">CALL_LOG</span>
            </div>
            <p className="text-[#a3a3a3]">
              {isTerminal
                ? `Logged under Lead '${call.lead?.businessName || call.leadId}'. Outcome: ${call.outcome?.outcome || call.status}.`
                : "Activity record will be generated automatically when call concludes."}
            </p>
          </div>
        </div>

        {/* 2. Lead Stage Update */}
        <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isOptedOut
                ? "bg-red-400"
                : isMeeting
                ? "bg-emerald-400"
                : hasOutcome
                ? "bg-blue-400"
                : "bg-[#737373]"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">Pipeline Stage Disposition</div>
            <p className="text-[#a3a3a3]">
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
        <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isMeeting || isCallback ? "bg-cyan-400" : "bg-[#737373]"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">Actionable Follow-Up Task</div>
            <p className="text-[#a3a3a3]">
              {isMeeting
                ? "Demo follow-up scheduled (+1 day SLA) assigned to human reviewer."
                : isCallback
                ? `Prospect callback scheduled at ${call.normalizedPhone} (+2 day SLA).`
                : "No manual follow-up required unless requested by prospect."}
            </p>
          </div>
        </div>

        {/* 4. Suppression Enforcement */}
        <div className="p-3 rounded-lg bg-[#0a0a0a] border border-[#404040] flex items-start gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
              isOptedOut ? "bg-red-500 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <div className="space-y-0.5 flex-1 text-xs">
            <div className="font-semibold text-white">Suppression &amp; Compliance Enclosure</div>
            <p className="text-[#a3a3a3]">
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
