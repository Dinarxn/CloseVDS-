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
      return "bg-[#C6FF33] border-lime-500/80 shadow-[0_0_8px_rgba(198,255,51,0.3)]";
    case "CALL_INITIATED":
    case "CALL_RINGING":
    case "CALL_TRANSFERRED":
      return "bg-violet-400 border-violet-600 shadow-[0_0_8px_rgba(125,57,235,0.3)]";
    case "CALL_FAILED":
    case "CALL_OPT_OUT":
      return "bg-rose-500 border-rose-700 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
    case "CALL_BUSY":
    case "CALL_NO_ANSWER":
    case "CALL_VOICEMAIL":
      return "bg-amber-400 border-amber-600";
    case "CALL_CREATED":
    case "CALL_CANCELLED":
    default:
      return "bg-zinc-500 border-zinc-700";
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
      <div className="p-8 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card font-mono">
        No timeline events recorded yet for this call.
      </div>
    );
  }

  // Sort events chronologically (oldest to newest)
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.08]">
      {sorted.map((ev, index) => {
        const dotColor = getEventColor(ev.eventType);
        return (
          <div key={ev.id || index} className="relative group">
            {/* Timeline Dot */}
            <div
              className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${dotColor}`}
            />

            <div className="bg-surface-card p-4 rounded-xl border border-white/[0.08] hover:border-white/[0.16] transition-colors shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-white tracking-tight">
                  {formatEventTitle(ev.eventType)}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {formatCallDateTime(ev.occurredAt)}
                </span>
              </div>

              <div className="text-[11px] font-mono text-zinc-500 mb-1">
                {ev.eventType}
              </div>

              {ev.eventPayload && Object.keys(ev.eventPayload).length > 0 && (
                <div className="mt-2.5 p-2.5 bg-surface-panel rounded-lg border border-white/[0.06] text-[11px] text-zinc-300 font-mono overflow-x-auto">
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
