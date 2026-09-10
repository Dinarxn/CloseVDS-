"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceAgentConfig } from "@/types/calling";
import { formatCallDuration } from "@/lib/mappers";

export interface VoiceAgentCardProps {
  agent: VoiceAgentConfig;
}

export function VoiceAgentCard({ agent }: VoiceAgentCardProps) {
  return (
    <Card variant="standard" className="flex flex-col justify-between hover:border-white/[0.2] transition-all relative overflow-hidden">
      {/* Top light reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-bold">{agent.name}</CardTitle>
            <Badge variant="outline" size="sm" className="font-mono text-[10px] tabular-nums">
              Max {formatCallDuration(agent.maxDurationSeconds)}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {agent.callObjective}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-3 bg-[#0d0d12] rounded-xl border border-white/[0.06] text-xs">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1 font-semibold">
              Opening Script Hook
            </span>
            <p className="text-zinc-300 italic line-clamp-3 leading-relaxed">
              &quot;{agent.openingScript}&quot;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#0d0d12] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 block font-mono">Qual. Questions</span>
              <span className="font-semibold text-white tabular-nums font-mono">
                {agent.qualificationQuestions?.length || 0} Questions
              </span>
            </div>

            <div className="p-2.5 bg-[#0d0d12] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 block font-mono">Talking Points</span>
              <span className="font-semibold text-white tabular-nums font-mono">
                {agent.approvedTalkingPoints?.length || 0} Points
              </span>
            </div>

            <div className="p-2.5 bg-[#0d0d12] rounded-xl border border-rose-950/40">
              <span className="text-[10px] text-rose-400/80 block font-mono">Prohibited Claims</span>
              <span className="font-semibold text-rose-400 tabular-nums font-mono">
                {agent.prohibitedClaims?.length || 0} Rules
              </span>
            </div>

            <div className="p-2.5 bg-[#0d0d12] rounded-xl border border-amber-950/40">
              <span className="text-[10px] text-amber-400/80 block font-mono">Escalation Rules</span>
              <span className="font-semibold text-amber-400 tabular-nums font-mono">
                {agent.escalationConditions?.length || 0} Conditions
              </span>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0 border-t border-white/[0.06] mt-4 flex items-center justify-end gap-2">
        <Link href={`/calling/agents/${agent.id}/edit`}>
          <Button variant="outline" size="sm">
            Edit Configuration
          </Button>
        </Link>
      </div>
    </Card>
  );
}
