"use client";

import React from "react";
import { CallEvent, CallEventType } from "@/types/calling";
import { formatCallDateTime } from "@/lib/mappers";

export interface CallTimelineProps {
  events?: CallEvent[];
}

function getEventColor(eventType: CallEventType): string {
  switch (eventType) {
    case "CALL_COMPLETED":
    case "CALL_ANSWERED":
    case "CALL_STARTED":
    case "CALL_MEDIA_CONNECTED":
      return "bg-emerald-400 border-emerald-600";
    case "CALL_INITIATED":
    case "CALL_RINGING":
    case "CALL_TRANSFERRED":
      return "bg-blue-400 border-blue-600";
    case "CALL_FAILED":
    case "CALL_OPT_OUT":
      return "bg-red-500 border-red-700";
    case "CALL_BUSY":
    case "CALL_NO_ANSWER":
    case "CALL_VOICEMAIL":
      return "bg-amber-400 border-amber-600";
    case "CALL_CREATED":
    case "CALL_CANCELLED":
    default:
      return "bg-[#737373] border-[#525252]";
  }
}

function formatEventTitle(eventType: CallEventType): string {
  switch (eventType) {
    case "CALL_CREATED":
      return "Call Prepared & Created";
    case "CALL_INITIATED":
      return "Telephony Dispatch Initiated";
    case "CALL_RINGING":
      return "Ringing Prospect Handset";
    case "CALL_ANSWERED":
      return "Call Answered";
    case "CALL_STARTED":
      return "Voice AI Session Started";
    case "CALL_MEDIA_CONNECTED":
      return "Audio Media Stream Connected";
    case "CALL_TRANSFERRED":
      return "Call Transferred";
    case "CALL_COMPLETED":
      return "Call Completed Normally";
    case "CALL_FAILED":
      return "Telephony Call Failed";
    case "CALL_BUSY":
      return "Recipient Line Busy";
    case "CALL_NO_ANSWER":
      return "No Answer / Ring Timeout";
    case "CALL_VOICEMAIL":
      return "Answering Machine Detected";
    case "CALL_CANCELLED":
      return "Call Cancelled by User";
    case "CALL_OPT_OUT":
      return "Prospect Opt-Out Triggered";
    default:
      return String(eventType).replace(/_/g, " ");
  }
}

export function CallTimeline({ events = [] }: CallTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[#737373] border border-[#404040]/60 rounded-lg bg-[#0a0a0a]">
        No timeline events recorded yet for this call.
      </div>
    );
  }

  // Sort events chronologically (oldest to newest)
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#404040]">
      {sorted.map((ev, index) => {
        const dotColor = getEventColor(ev.eventType);
        return (
          <div key={ev.id || index} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${dotColor}`}
            />

            <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#404040]/70 hover:border-[#525252] transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-white">
                  {formatEventTitle(ev.eventType)}
                </span>
                <span className="text-[10px] font-mono text-[#737373]">
                  {formatCallDateTime(ev.occurredAt)}
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#525252] mb-1">
                {ev.eventType}
              </div>

              {ev.eventPayload && Object.keys(ev.eventPayload).length > 0 && (
                <div className="mt-2 p-2 bg-[#171717] rounded border border-[#404040]/40 text-[11px] text-[#a3a3a3] font-mono overflow-x-auto">
                  {JSON.stringify(ev.eventPayload, null, 2)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
