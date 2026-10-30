"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  PhoneIcon,
  CheckCircleIcon,
  BuildingIcon,
  ClockIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@/components/ui/icons";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import { CallPreparationModal } from "@/components/calling/call-preparation-modal";
import type { OperationTask } from "@/types/operations";

export interface CallReadyProspectsProps {
  tasks: OperationTask[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function CallReadyProspects({
  tasks,
  isLoading,
  onRefresh,
}: CallReadyProspectsProps) {
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<string | null>(null);
  const [leadForCallPrep, setLeadForCallPrep] = useState<string | null>(null);

  function formatReadyTime(val?: string | Date) {
    if (!val) return "—";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return "—";
      return (
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
        " · " +
        d.toLocaleDateString([], { month: "short", day: "numeric" })
      );
    } catch {
      return "—";
    }
  }

  // Extract or compute qualification score from metadata or reason
  function extractScore(task: OperationTask): number | null {
    if (typeof task.metadata?.score === "number") return task.metadata.score;
    if (typeof task.metadata?.qualificationScore === "number") return task.metadata.qualificationScore;
    if (task.reason) {
      const match = task.reason.match(/(?:score[:\s]*|qualification[:\s]*|rate[:\s]*)(\d+)/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
      }
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-surface-panel shadow-xs space-y-3">
        <div className="w-6 h-6 border-2 border-[#C6FF33] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Scanning call-ready prospects...
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No Call-Ready Prospects"
        description="Leads must pass automated safety screening and receive human authorization via the Step 20 review in the Lead Pool to become eligible for outbound calling."
        icon={<CheckCircleIcon size={22} className="text-[#C6FF33]" />}
        action={
          <Link href="/leads">
            <Button
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <span>Open Lead Pool</span>
              <ArrowRightIcon size={14} />
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3.5">
      {/* Subheader summary bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C6FF33] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Pre-Flight Safety Cleared Prospects (CALL_READY)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#C6FF33] bg-[#C6FF33]/10 px-2.5 py-0.5 rounded-lg border border-[#C6FF33]/25 tabular-nums font-semibold">
            {tasks.length} Prospect{tasks.length === 1 ? "" : "s"} Ready for Voice AI
          </span>
        </div>
      </div>

      {/* Prospect cards */}
      <div className="space-y-2.5">
        {tasks.map((task) => {
          const score = extractScore(task);
          const isHighScore = score !== null && score >= 85;

          return (
            <div
              key={task.id}
              className="p-4 bg-surface-card border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-card-hover rounded-xl transition-all duration-150 shadow-xs relative overflow-hidden group"
            >
              {/* Left-edge Lime accent for call-ready */}
              <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#C6FF33] pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pl-1.5">
                <div className="space-y-2 min-w-0 flex-1">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#C6FF33]/15 text-[#C6FF33] border border-[#C6FF33]/30">
                      <CheckCircleIcon size={11} className="text-[#C6FF33]" />
                      <span>Safety Cleared</span>
                    </span>

                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                      Step 20 Human Approved
                    </span>

                    {score !== null ? (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full tabular-nums border flex items-center gap-1 ${
                          isHighScore
                            ? "bg-[#C6FF33]/10 text-[#C6FF33] border-[#C6FF33]/30"
                            : "bg-amber-950/30 text-amber-300 border-amber-500/25"
                        }`}
                      >
                        <SparklesIcon size={11} />
                        <span>Qual Score: {score}/100</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Qualified
                      </span>
                    )}

                    <Badge variant={task.priority === "CRITICAL" ? "danger" : "secondary"} size="sm">
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Company Title */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLeadForDetail(task.targetId)}
                      className="text-sm font-semibold text-white tracking-tight hover:text-[#B788FF] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <BuildingIcon size={14} className="text-zinc-500 group-hover:text-[#7D39EB] transition-colors shrink-0" />
                      <span>{task.target}</span>
                    </button>
                  </div>

                  {/* Reason / Analysis */}
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                    {task.reason}
                  </p>

                  {/* Ready since timestamp */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 pt-0.5">
                    <ClockIcon size={12} className="text-zinc-500" />
                    <span>Eligible since: {formatReadyTime(task.timestamp)}</span>
                  </div>
                </div>

                {/* Right CTA controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedLeadForDetail(task.targetId)}
                    className="h-8 px-3 text-xs"
                  >
                    <span>Inspect Lead</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setLeadForCallPrep(task.targetId)}
                    className="h-8 px-3 text-xs gap-1.5 font-medium"
                  >
                    <PhoneIcon size={12} />
                    <span>Launch Call</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Detail Modal */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          isOpen={true}
          leadId={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
          onLeadUpdated={onRefresh}
        />
      )}

      {/* Call Preparation Modal */}
      {leadForCallPrep && (
        <CallPreparationModal
          isOpen={true}
          onClose={() => setLeadForCallPrep(null)}
          initialLeadId={leadForCallPrep}
          onCallCreated={() => {
            setLeadForCallPrep(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
