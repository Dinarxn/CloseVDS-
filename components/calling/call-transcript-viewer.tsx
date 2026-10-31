"use client";

import React from "react";
import { CallTranscriptTurn } from "@/types/calling";
import { formatCallDateTime } from "@/lib/mappers";

export interface CallTranscriptViewerProps {
  transcripts?: CallTranscriptTurn[];
  isLoading?: boolean;
}

function getSentimentBadge(sentiment?: string | null) {
  if (!sentiment) return null;
  const s = sentiment.toLowerCase();

  if (s.includes("positive") || s.includes("interest") || s.includes("enthusiastic")) {
    return (
      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-lime-500/10 text-[#C6FF33] border border-lime-500/25">
        ● {sentiment}
      </span>
    );
  }

  if (s.includes("negative") || s.includes("frustrated") || s.includes("reject")) {
    return (
      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/25">
        ● {sentiment}
      </span>
    );
  }

  if (s.includes("skeptic") || s.includes("hesitant") || s.includes("busy")) {
    return (
      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25">
        ● {sentiment}
      </span>
    );
  }

  return (
    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold bg-zinc-800 text-zinc-400 border border-white/[0.08]">
      ● {sentiment}
    </span>
  );
}

export function CallTranscriptViewer({
  transcripts = [],
  isLoading = false,
}: CallTranscriptViewerProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="font-mono">Loading synchronized call transcript turns...</span>
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card space-y-1.5 shadow-xs">
        <div className="w-8 h-8 rounded-full bg-surface-panel border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400 mb-2">
          🎙
        </div>
        <p className="font-semibold text-white">No transcript turns recorded yet</p>
        <p className="text-zinc-500 max-w-sm mx-auto text-[11px]">
          Transcript entries are streamed in real-time as speech-to-text turns occur during an active voice session.
        </p>
      </div>
    );
  }

  // Sort by turnIndex
  const sorted = [...transcripts].sort((a, b) => a.turnIndex - b.turnIndex);
  const firstTimestampMs = sorted[0]?.timestampMs ?? 0;

  return (
    <div className="space-y-4">
      {sorted.map((turn) => {
        const isAgent = turn.speaker === "agent";
        const isLead = turn.speaker === "lead";

        const relativeSeconds =
          turn.timestampMs !== undefined && turn.timestampMs !== null
            ? ((turn.timestampMs - firstTimestampMs) / 1000).toFixed(1)
            : null;

        return (
          <div
            key={turn.id || turn.turnIndex}
            className={`flex flex-col ${
              isAgent
                ? "items-end"
                : isLead
                ? "items-start"
                : "items-center"
            }`}
          >
            {/* Header: Speaker, Sentiment, Latency, Offset */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5 px-1 text-[10px]">
              <span
                className={`font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                  isAgent
                    ? "text-violet-400"
                    : isLead
                    ? "text-[#C6FF33]"
                    : "text-zinc-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAgent
                      ? "bg-violet-400"
                      : isLead
                      ? "bg-[#C6FF33]"
                      : "bg-zinc-500"
                  }`}
                />
                {isAgent ? "AI Voice Agent" : isLead ? "Prospect / Lead" : "System Guardrail"}
              </span>

              {/* Sentiment Indicator */}
              {getSentimentBadge(turn.sentiment)}

              {/* Confidence badge */}
              {turn.confidence !== null && turn.confidence !== undefined && (
                <span className="text-zinc-400 font-mono">
                  {Math.round(turn.confidence * 100)}% conf
                </span>
              )}

              {/* Turnaround / Latency Telemetry */}
              {turn.latencyMs !== undefined && turn.latencyMs !== null && (
                <span className="px-1.5 py-0.5 rounded bg-surface-panel border border-white/[0.06] text-zinc-400 font-mono text-[9px]">
                  ⚡ {turn.latencyMs}ms latency
                </span>
              )}

              {/* Relative Offset or Timestamp */}
              {relativeSeconds !== null ? (
                <span className="text-zinc-500 font-mono">+{relativeSeconds}s</span>
              ) : turn.createdAt ? (
                <span className="text-zinc-500 font-mono">
                  {formatCallDateTime(turn.createdAt)}
                </span>
              ) : null}
            </div>

            {/* Turn Message Bubble */}
            <div
              className={`max-w-[82%] rounded-xl p-3.5 text-xs leading-relaxed shadow-xs transition-all ${
                isAgent
                  ? "bg-violet-950/20 border border-violet-500/30 text-white rounded-br-none hover:border-violet-500/50"
                  : isLead
                  ? "bg-surface-card border border-white/[0.08] text-white rounded-bl-none hover:border-white/[0.16]"
                  : "bg-surface-panel border border-white/[0.06] text-zinc-400 text-center font-mono text-[11px]"
              }`}
            >
              {turn.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
