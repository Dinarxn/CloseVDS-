"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VoiceAgentConfig } from "@/types/calling";
import { formatCallDuration } from "@/lib/mappers";

export interface VoiceAgentCardProps {
  agent: VoiceAgentConfig;
}

export function VoiceAgentCard({ agent }: VoiceAgentCardProps) {
  return (
    <div className="rounded-xl bg-[#0c0c12] border border-white/[0.08] hover:border-white/[0.14] transition-all p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
      {/* Top light reflection */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-white tracking-tight">{agent.name}</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08] tabular-nums">
              Max {formatCallDuration(agent.maxDurationSeconds)}
            </span>
          </div>
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {agent.callObjective}
          </p>
        </div>

        <div className="p-3 bg-[#08080d] rounded-xl border border-white/[0.06] text-xs space-y-1">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-medium">
            Opening Script Hook
          </span>
          <p className="text-zinc-300 italic line-clamp-3 leading-relaxed text-[11px]">
            &quot;{agent.openingScript}&quot;
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-[#08080d] rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 block font-mono">Qual. Questions</span>
            <span className="font-semibold text-white tabular-nums font-mono text-xs">
              {agent.qualificationQuestions?.length || 0} Questions
            </span>
          </div>

          <div className="p-2.5 bg-[#08080d] rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 block font-mono">Talking Points</span>
            <span className="font-semibold text-white tabular-nums font-mono text-xs">
              {agent.approvedTalkingPoints?.length || 0} Points
            </span>
          </div>

          <div className="p-2.5 bg-[#08080d] rounded-xl border border-rose-500/20">
            <span className="text-[10px] text-rose-400/80 block font-mono">Prohibited Claims</span>
            <span className="font-semibold text-rose-400 tabular-nums font-mono text-xs">
              {agent.prohibitedClaims?.length || 0} Rules
            </span>
          </div>

          <div className="p-2.5 bg-[#08080d] rounded-xl border border-amber-500/20">
            <span className="text-[10px] text-amber-400/80 block font-mono">Escalation Rules</span>
            <span className="font-semibold text-amber-400 tabular-nums font-mono text-xs">
              {agent.escalationConditions?.length || 0} Conditions
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] mt-4 flex items-center justify-end">
        <Link href={`/calling/agents/${agent.id}/edit`}>
          <Button
            variant="secondary"
            size="sm"
            className="h-7.5 px-3 text-xs bg-[#101017] hover:bg-[#161622] text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs"
          >
            Edit Configuration
          </Button>
        </Link>
      </div>
    </div>
  );
}
