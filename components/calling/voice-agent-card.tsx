"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VoiceAgentStudioConfig, VoiceAgentLifecycleStatus } from "@/types/voice-agent";
import { VoiceAgentConfig } from "@/types/calling";
import { formatCallDuration } from "@/lib/mappers";

export interface VoiceAgentCardProps {
  agent: VoiceAgentStudioConfig | VoiceAgentConfig;
}

export function VoiceAgentCard({ agent }: VoiceAgentCardProps) {
  const studioAgent = agent as Partial<VoiceAgentStudioConfig>;
  const status: VoiceAgentLifecycleStatus = studioAgent.status || "DRAFT";
  const duration =
    (agent as { maxDurationSeconds?: number }).maxDurationSeconds ||
    studioAgent.safety?.maxDurationSeconds ||
    300;

  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-white/[0.08] hover:border-violet-500/40 transition-all p-5 flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      {/* Top light reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-violet-300 transition-colors">
              {agent.name}
            </h4>

            {/* Status Pill with Obsidian Palette */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border tabular-nums ${
                status === "ACTIVE"
                  ? "bg-[#C6FF33]/15 text-[#C6FF33] border-lime-500/30 shadow-[0_0_8px_rgba(198,255,51,0.2)]"
                  : status === "TESTED"
                  ? "bg-violet-950/40 text-violet-300 border-violet-500/40"
                  : status === "READY_FOR_TEST"
                  ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                  : status === "PAUSED"
                  ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                  : status === "ERROR"
                  ? "bg-rose-950/40 text-rose-300 border-rose-500/40"
                  : "bg-surface-elevated text-zinc-400 border-white/[0.08]"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            {studioAgent.provider && (
              <span className="uppercase text-zinc-300">[{studioAgent.provider}]</span>
            )}
            <span>Max {formatCallDuration(duration)}</span>
            {studioAgent.assignedPhoneNumber && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-[#C6FF33]">{studioAgent.assignedPhoneNumber}</span>
              </>
            )}
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
            {agent.callObjective}
          </p>
        </div>

        <div className="p-3 bg-surface-panel rounded-xl border border-white/[0.06] text-xs space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-medium">
            Opening Script Hook
          </span>
          <p className="text-zinc-300 italic line-clamp-2 leading-relaxed text-[11px] font-sans">
            &quot;{agent.openingScript}&quot;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-surface-panel rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-400 block font-mono">Qual. Questions</span>
            <span className="font-semibold text-white tabular-nums font-mono text-xs">
              {agent.qualificationQuestions?.length || 0} Questions
            </span>
          </div>

          <div className="p-2.5 bg-surface-panel rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-400 block font-mono">Talking Points</span>
            <span className="font-semibold text-[#C6FF33] tabular-nums font-mono text-xs">
              {agent.approvedTalkingPoints?.length || 0} Points
            </span>
          </div>

          <div className="p-2.5 bg-surface-panel rounded-xl border border-rose-500/25">
            <span className="text-[10px] text-rose-300/80 block font-mono">Prohibited Claims</span>
            <span className="font-semibold text-rose-400 tabular-nums font-mono text-xs">
              {agent.prohibitedClaims?.length || 0} Rules
            </span>
          </div>

          <div className="p-2.5 bg-surface-panel rounded-xl border border-amber-500/25">
            <span className="text-[10px] text-amber-300/80 block font-mono">Escalation Rules</span>
            <span className="font-semibold text-amber-400 tabular-nums font-mono text-xs">
              {agent.escalationConditions?.length || 0} Conditions
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] mt-4 flex items-center justify-between">
        <Link href={`/calling/agents/${agent.id}`}>
          <span className="text-xs text-zinc-400 hover:text-white cursor-pointer font-sans">
            View Details
          </span>
        </Link>

        <Link href={`/calling/agents/${agent.id}/edit`}>
          <Button
            variant="secondary"
            size="sm"
            className="h-7.5 px-3 text-xs bg-surface-elevated hover:bg-surface-panel text-zinc-200 hover:text-white border-white/[0.08] hover:border-violet-500/40 shadow-xs"
          >
            Open Studio
          </Button>
        </Link>
      </div>
    </div>
  );
}
