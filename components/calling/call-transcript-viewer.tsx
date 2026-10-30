"use client";

import React from "react";
import { CallTranscriptTurn } from "@/types/calling";
import { formatCallDateTime } from "@/lib/mappers";

export interface CallTranscriptViewerProps {
  transcripts?: CallTranscriptTurn[];
  isLoading?: boolean;
}

export function CallTranscriptViewer({
  transcripts = [],
  isLoading = false,
}: CallTranscriptViewerProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="font-mono">Loading call transcript turns...</span>
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
          Transcript entries are streamed in real-time as speech-to-text turns occur during a live call.
        </p>
      </div>
    );
  }

  // Sort by turnIndex
  const sorted = [...transcripts].sort((a, b) => a.turnIndex - b.turnIndex);

  return (
    <div className="space-y-4">
      {sorted.map((turn) => {
        const isAgent = turn.speaker === "agent";
        const isLead = turn.speaker === "lead";

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
            {/* Speaker Tag */}
            <div className="flex items-center gap-2 mb-1 px-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                  isAgent
                    ? "text-violet-400"
                    : isLead
                    ? "text-[#C6FF33]"
                    : "text-zinc-400"
                }`}
              >
                {isAgent ? "AI Voice Agent" : isLead ? "Prospect / Lead" : "System Guardrail"}
              </span>

              {turn.confidence !== null && turn.confidence !== undefined && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  {Math.round(turn.confidence * 100)}% conf
                </span>
              )}

              {turn.createdAt && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatCallDateTime(turn.createdAt)}
                </span>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[82%] rounded-xl p-3.5 text-xs leading-relaxed shadow-xs ${
                isAgent
                  ? "bg-violet-950/20 border border-violet-500/30 text-white rounded-br-none"
                  : isLead
                  ? "bg-surface-card border border-white/[0.08] text-white rounded-bl-none"
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
