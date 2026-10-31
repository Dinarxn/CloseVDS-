"use client";

import React, { useState, useEffect } from "react";
import { CallEvent, CallEventType, CallTimelineMilestone, CallMilestoneStep } from "@/types/calling";
import { formatCallDateTime } from "@/lib/mappers";
import { api } from "@/lib/api-client";

export interface CallTimelineProps {
  events?: CallEvent[];
  milestones?: CallTimelineMilestone[];
  callId?: string;
}

const MILESTONE_STEPS: Array<{ key: CallMilestoneStep; label: string }> = [
  { key: "PREPARED", label: "Prepared" },
  { key: "APPROVED", label: "Approved" },
  { key: "QUEUED", label: "Queued" },
  { key: "INITIATING", label: "Initiating" },
  { key: "RINGING", label: "Ringing" },
  { key: "CONNECTED", label: "Connected" },
  { key: "TRANSCRIBING", label: "Transcribing" },
  { key: "ENDED", label: "Ended" },
];

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

export function CallTimeline({ events = [], milestones: initialMilestones, callId }: CallTimelineProps) {
  const [milestones, setMilestones] = useState<CallTimelineMilestone[]>(initialMilestones || []);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  useEffect(() => {
    if (initialMilestones && initialMilestones.length > 0) {
      setMilestones(initialMilestones);
      return;
    }

    if (callId) {
      setIsLoadingMilestones(true);
      (api.voice as unknown as { getTimeline: (id: string) => Promise<{ data?: CallTimelineMilestone[] }> })
        .getTimeline(callId)
        .then((res: { data?: CallTimelineMilestone[] }) => {
          if (res?.data) setMilestones(res.data);
        })
        .catch(() => {
          // fallback to computing from events
        })
        .finally(() => setIsLoadingMilestones(false));
    }
  }, [callId, initialMilestones]);

  // If no milestones from server, construct from events
  const computedMilestones: CallTimelineMilestone[] =
    milestones.length > 0
      ? milestones
      : MILESTONE_STEPS.map(({ key, label }) => {
          const matchingEvent = events.find((e) => {
            if (key === "PREPARED") return e.eventType === "CALL_CREATED";
            if (key === "APPROVED") return e.eventType === "CALL_CREATED";
            if (key === "QUEUED") return e.eventType === "CALL_CREATED";
            if (key === "INITIATING") return e.eventType === "CALL_INITIATED";
            if (key === "RINGING") return e.eventType === "CALL_RINGING";
            if (key === "CONNECTED") return e.eventType === "CALL_ANSWERED" || e.eventType === "CALL_STARTED";
            if (key === "TRANSCRIBING") return e.eventType === "CALL_STARTED" || e.eventType === "CALL_MEDIA_CONNECTED";
            if (key === "ENDED") return e.eventType === "CALL_COMPLETED" || e.eventType === "CALL_FAILED";
            return false;
          });

          return {
            step: key,
            label,
            status: matchingEvent ? "COMPLETED" : "PENDING",
            timestamp: matchingEvent?.occurredAt,
            actor: key === "APPROVED" ? "Operator" : "Voice AI",
            description: matchingEvent ? formatEventTitle(matchingEvent.eventType) : undefined,
          };
        });

  // Sort events chronologically (oldest to newest)
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* 8-Step Milestone Progression Bar */}
      <div className="p-4 rounded-xl bg-surface-panel border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Milestone Progression (8-Step Invariant Pipeline)
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {isLoadingMilestones
              ? "Fetching server milestones..."
              : `${computedMilestones.filter((m) => m.status === "COMPLETED").length} of 8 Steps Complete`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {computedMilestones.map((m, idx) => {
            const isCompleted = m.status === "COMPLETED";
            const isInProgress = m.status === "ACTIVE" || (m.status as string) === "IN_PROGRESS";
            const isFailed = m.status === "FAILED";

            return (
              <div
                key={m.step}
                className={`p-2.5 rounded-lg border flex flex-col justify-between text-xs transition-colors ${
                  isCompleted
                    ? "bg-lime-500/10 border-lime-500/25 text-white"
                    : isInProgress
                    ? "bg-violet-950/30 border-violet-500/40 text-violet-200"
                    : isFailed
                    ? "bg-rose-950/30 border-rose-500/35 text-rose-300"
                    : "bg-surface-elevated/40 border-white/[0.04] text-zinc-500"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold text-zinc-400">
                    0{idx + 1}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCompleted
                        ? "bg-[#C6FF33] shadow-[0_0_6px_rgba(198,255,51,0.6)]"
                        : isInProgress
                        ? "bg-violet-400 animate-pulse"
                        : isFailed
                        ? "bg-rose-500"
                        : "bg-zinc-700"
                    }`}
                  />
                </div>

                <div className="font-semibold text-[11px] truncate">{m.label}</div>

                <div className="mt-1 flex items-center justify-between text-[9px] font-mono">
                  <span
                    className={`uppercase font-medium ${
                      isCompleted
                        ? "text-[#C6FF33]"
                        : isInProgress
                        ? "text-violet-300"
                        : isFailed
                        ? "text-rose-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {m.status}
                  </span>
                  {m.timestamp && (
                    <span className="text-zinc-400">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological Event Detail Log */}
      {sorted.length === 0 ? (
        <div className="p-8 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card font-mono">
          No detailed events recorded yet for this call session.
        </div>
      ) : (
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
      )}
    </div>
  );
}
