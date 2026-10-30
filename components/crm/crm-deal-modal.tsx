"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CrmActivityTimeline } from "./crm-activity-timeline";
import { getAllowedNextStages } from "@/lib/mappers";
import { api, ApiClientError } from "@/lib/api-client";
import type { CrmDealItem } from "@/types/crm";

export interface CrmDealModalProps {
  deal: CrmDealItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated?: () => void;
}

export function CrmDealModal({
  deal,
  isOpen,
  onClose,
  onDealUpdated,
}: CrmDealModalProps) {
  const [selectedNextStage, setSelectedNextStage] = useState<string>("");
  const [transitionNote, setTransitionNote] = useState<string>("");
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);
  const [stageSuccess, setStageSuccess] = useState<string | null>(null);

  // Quick follow-up task form state
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  if (!deal) return null;

  const allowedNextStages = getAllowedNextStages(deal.rawStatus);
  const isTerminal = deal.rawStatus === "OPT_OUT";
  const isClosedWon = deal.stage === "closed_won";
  const isHighQualification = (deal.qualificationScore ?? 0) >= 70;

  const handleStageTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNextStage) return;

    setIsUpdatingStage(true);
    setStageError(null);
    setStageSuccess(null);

    try {
      await api.crm.updateStage(deal.leadId, {
        status: selectedNextStage,
        note: transitionNote.trim() || undefined,
      });

      setStageSuccess(`Stage successfully updated to ${selectedNextStage}`);
      setSelectedNextStage("");
      setTransitionNote("");
      onDealUpdated?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setStageError(err.message);
      } else {
        setStageError("Failed to transition lead stage.");
      }
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const handleQuickCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsCreatingTask(true);
    setTaskError(null);
    setTaskSuccess(null);

    try {
      await api.followUps.create({
        leadId: deal.leadId,
        title: taskTitle.trim(),
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        status: "PENDING",
      });

      setTaskSuccess("Follow-up task created in CRM.");
      setTaskTitle("");
      setTaskDueDate("");
      onDealUpdated?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setTaskError(err.message);
      } else {
        setTaskError("Failed to schedule follow-up.");
      }
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={deal.companyName}
      description="Inspect deal profile, contact history, stage progression, and scheduling."
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Deal Header Summary Card */}
        <div className="p-4 rounded-xl bg-surface-card border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs relative overflow-hidden">
          {/* Top specular hairline */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.12] font-semibold uppercase">
                {deal.rawStatus}
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded tabular-nums border ${
                  isClosedWon
                    ? "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                    : "bg-surface-elevated text-white border-white/[0.10]"
                }`}
              >
                {deal.valueEstimate ? `$${deal.valueEstimate.toLocaleString()}` : "$3,500"}
              </span>
              {deal.qualificationScore !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold tabular-nums border ${
                    isHighQualification
                      ? "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                      : "bg-white/[0.04] text-[#8E8E9F] border-white/[0.08]"
                  }`}
                >
                  Score {deal.qualificationScore}
                </span>
              )}
              <span className="text-xs text-[#8E8E9F] font-mono">
                Pipeline: <span className="text-white capitalize">{deal.stage.replace(/_/g, " ")}</span>
              </span>
            </div>

            <div className="text-xs text-[#CBCBD6] flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
              {deal.contactName && (
                <span className="flex items-center gap-1.5">
                  <span className="text-[#8E8E9F]">Contact:</span>
                  <strong className="text-white font-medium">{deal.contactName}</strong>
                </span>
              )}
              {deal.contactEmail && (
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-[#8E8E9F]">Email:</span>
                  <strong className="text-white font-medium">{deal.contactEmail}</strong>
                </span>
              )}
              {deal.contactPhone && (
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-[#8E8E9F]">Phone:</span>
                  <strong className="text-white font-medium">{deal.contactPhone}</strong>
                </span>
              )}
              {deal.leadSource && (
                <span className="flex items-center gap-1.5">
                  <span className="text-[#8E8E9F]">Source:</span>
                  <strong className="text-white font-medium">{deal.leadSource}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link href="/calling">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs bg-surface-elevated hover:bg-surface-card-hover text-zinc-200 hover:text-white border-white/[0.10] flex items-center gap-1.5 shadow-xs"
              >
                <span>Calling Studio</span>
                <span className="text-[#8E8E9F]">→</span>
              </Button>
            </Link>
            <Link href="/outreach">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs bg-surface-elevated hover:bg-surface-card-hover text-zinc-200 hover:text-white border-white/[0.10] flex items-center gap-1.5 shadow-xs"
              >
                <span>Outreach Center</span>
                <span className="text-[#8E8E9F]">→</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* SECTION: Stage Transition Controls */}
        <div className="p-4 rounded-xl bg-surface-card border border-white/[0.08] space-y-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                CRM Stage Progression
              </h4>
              <p className="text-[11px] text-[#8E8E9F] mt-0.5">
                Stage transitions strictly follow verified backend lifecycle rules.
              </p>
            </div>
            {isTerminal && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold">
                Regulatory Boundary Active
              </span>
            )}
          </div>

          {stageSuccess && (
            <div className="p-2.5 rounded-lg bg-[#C6FF33]/10 border border-[#C6FF33]/25 text-xs text-[#C6FF33] flex items-center justify-between">
              <span>{stageSuccess}</span>
              <button
                type="button"
                onClick={() => setStageSuccess(null)}
                className="text-[#C6FF33] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {stageError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
              <span>{stageError}</span>
              <button
                type="button"
                onClick={() => setStageError(null)}
                className="text-rose-400 hover:text-rose-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {isTerminal ? (
            <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/15">
              <p className="text-xs text-rose-300/80 leading-relaxed">
                This prospect has recorded an explicit OPT_OUT request. Regulatory suppression boundary is active; stage transitions and further outbound touches are strictly halted.
              </p>
            </div>
          ) : allowedNextStages.length === 0 ? (
            <p className="text-xs text-[#8E8E9F] italic">
              No further automatic transitions available from stage {deal.rawStatus}.
            </p>
          ) : (
            <form onSubmit={handleStageTransition} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] font-semibold block">
                    Target Next Stage <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedNextStage}
                    onChange={(e) => setSelectedNextStage(e.target.value)}
                    disabled={isUpdatingStage}
                    className="w-full h-8.5 px-3 bg-surface-input text-white text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB]/40 transition-colors shadow-xs font-mono"
                  >
                    <option value="" disabled className="bg-surface-panel text-[#8E8E9F]">
                      Select allowed stage...
                    </option>
                    {allowedNextStages.map((st) => (
                      <option key={st} value={st} className="bg-surface-panel text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] font-semibold block">
                    Transition Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call connected, operator booked demo for Thursday"
                    value={transitionNote}
                    onChange={(e) => setTransitionNote(e.target.value)}
                    disabled={isUpdatingStage}
                    className="w-full h-8.5 px-3 bg-surface-input text-white text-xs rounded-lg border border-white/[0.08] placeholder:text-[#8E8E9F] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB]/40 transition-colors shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#8E8E9F] font-mono">
                  Allowed next: {allowedNextStages.join(", ")}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={!selectedNextStage || isUpdatingStage}
                  className="h-8 px-4 text-xs font-semibold cursor-pointer shadow-xs"
                >
                  {isUpdatingStage ? "Saving..." : "Update CRM Stage"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* SECTION: Quick Follow-Up Scheduler */}
        <div className="p-4 rounded-xl bg-surface-card border border-white/[0.08] space-y-3 shadow-xs relative overflow-hidden">
          <div className="border-b border-white/[0.06] pb-2.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Schedule Follow-Up Task
            </h4>
            <p className="text-[11px] text-[#8E8E9F] mt-0.5">
              Keep callback promises or organize future review touches for this prospect.
            </p>
          </div>

          {taskSuccess && (
            <div className="p-2.5 rounded-lg bg-[#C6FF33]/10 border border-[#C6FF33]/25 text-xs text-[#C6FF33] flex items-center justify-between">
              <span>{taskSuccess}</span>
              <button
                type="button"
                onClick={() => setTaskSuccess(null)}
                className="text-[#C6FF33] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {taskError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
              <span>{taskError}</span>
              <button
                type="button"
                onClick={() => setTaskError(null)}
                className="text-rose-400 hover:text-rose-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleQuickCreateFollowUp} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Follow-up task title..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                disabled={isCreatingTask}
                className="w-full h-8.5 px-3 bg-surface-input text-white text-xs rounded-lg border border-white/[0.08] placeholder:text-[#8E8E9F] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB]/40 transition-colors shadow-xs"
              />
              <input
                type="datetime-local"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                disabled={isCreatingTask}
                className="w-full h-8.5 px-3 bg-surface-input text-white text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB]/40 transition-colors shadow-xs"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={!taskTitle.trim() || isCreatingTask}
                className="h-8 px-3.5 text-xs border-white/[0.12] hover:border-[#7D39EB]/60 hover:text-white cursor-pointer"
              >
                {isCreatingTask ? "Saving..." : "+ Add Follow-Up"}
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION: Unified Activity Timeline */}
        <div className="p-4 rounded-xl bg-surface-card border border-white/[0.08] shadow-xs">
          <CrmActivityTimeline
            leadId={deal.leadId}
            leadBusinessName={deal.companyName}
            onActivityRecorded={() => onDealUpdated?.()}
          />
        </div>
      </div>
    </Dialog>
  );
}
