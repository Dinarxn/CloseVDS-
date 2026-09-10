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
      <div className="py-12 text-center text-xs text-[#737373] border border-[#404040]/60 rounded-lg bg-[#0a0a0a]">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading call transcript turns...
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="py-10 text-center text-xs text-[#737373] border border-[#404040]/60 rounded-lg bg-[#0a0a0a] space-y-1">
        <p className="font-medium text-white">No transcript turns recorded yet</p>
        <p className="text-[#525252]">
          Transcript entries are streamed in real-time as speech-to-text turns occur during a live call.
        </p>
      </div>
    );
  }

  // Sort by turnIndex
  const sorted = [...transcripts].sort((a, b) => a.turnIndex - b.turnIndex);

  return (
    <div className="space-y-3">
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
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isAgent
                    ? "text-blue-400"
                    : isLead
                    ? "text-emerald-400"
                    : "text-[#737373]"
                }`}
              >
                {isAgent ? "AI Voice Agent" : isLead ? "Prospect / Lead" : "System Guardrail"}
              </span>

              {turn.confidence !== null && turn.confidence !== undefined && (
                <span className="text-[10px] text-[#525252] font-mono">
                  {Math.round(turn.confidence * 100)}% conf
                </span>
              )}

              {turn.createdAt && (
                <span className="text-[10px] text-[#525252]">
                  {formatCallDateTime(turn.createdAt)}
                </span>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[80%] rounded-lg p-3 text-xs leading-relaxed ${
                isAgent
                  ? "bg-[#171717] border border-blue-900/60 text-white rounded-br-none"
                  : isLead
                  ? "bg-[#0a0a0a] border border-[#404040] text-white rounded-bl-none"
                  : "bg-stone-900 border border-stone-700 text-[#a3a3a3] text-center font-mono text-[11px]"
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
