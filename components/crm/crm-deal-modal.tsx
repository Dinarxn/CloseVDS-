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
      className="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Deal Header Summary Card */}
        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs relative overflow-hidden">
          {/* Precision top hairline */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.12] font-semibold uppercase">
                {deal.rawStatus}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
                {deal.valueEstimate ? `$${deal.valueEstimate.toLocaleString()}` : "$3,500"}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Pipeline: <span className="text-white capitalize">{deal.stage.replace(/_/g, " ")}</span>
              </span>
            </div>

            <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
              {deal.contactName && (
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Contact:</span>
                  <strong className="text-zinc-200 font-medium">{deal.contactName}</strong>
                </span>
              )}
              {deal.contactEmail && (
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-zinc-500">Email:</span>
                  <strong className="text-zinc-200 font-medium">{deal.contactEmail}</strong>
                </span>
              )}
              {deal.contactPhone && (
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <span className="text-zinc-500">Phone:</span>
                  <strong className="text-zinc-200 font-medium">{deal.contactPhone}</strong>
                </span>
              )}
              {deal.leadSource && (
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Source:</span>
                  <strong className="text-zinc-200 font-medium">{deal.leadSource}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link href="/calling">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08] flex items-center gap-1.5"
              >
                <span>Calling Studio</span>
                <span className="text-zinc-500">→</span>
              </Button>
            </Link>
            <Link href="/outreach">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 text-xs bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08] flex items-center gap-1.5"
              >
                <span>Outreach Center</span>
                <span className="text-zinc-500">→</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* SECTION: Stage Transition Controls */}
        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] space-y-3.5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                CRM Stage Progression
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
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
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
              <span>{stageSuccess}</span>
              <button type="button" onClick={() => setStageSuccess(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
            </div>
          )}

          {stageError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
              <span>{stageError}</span>
              <button type="button" onClick={() => setStageError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
            </div>
          )}

          {isTerminal ? (
            <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/15">
              <p className="text-xs text-rose-300/80 leading-relaxed">
                This prospect has recorded an explicit OPT_OUT request. Regulatory suppression boundary is active; stage transitions and further outbound touches are strictly halted.
              </p>
            </div>
          ) : allowedNextStages.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">
              No further automatic transitions available from stage {deal.rawStatus}.
            </p>
          ) : (
            <form onSubmit={handleStageTransition} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                    Target Next Stage <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={selectedNextStage}
                    onChange={(e) => setSelectedNextStage(e.target.value)}
                    disabled={isUpdatingStage}
                    className="w-full h-8.5 px-3 bg-[#09090e] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs font-mono"
                  >
                    <option value="" disabled>Select allowed stage...</option>
                    {allowedNextStages.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                    Transition Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call connected, operator booked demo for Thursday"
                    value={transitionNote}
                    onChange={(e) => setTransitionNote(e.target.value)}
                    disabled={isUpdatingStage}
                    className="w-full h-8.5 px-3 bg-[#09090e] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Allowed next: {allowedNextStages.join(", ")}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!selectedNextStage || isUpdatingStage}
                  className="h-8 px-3.5 text-xs bg-white text-black hover:bg-zinc-200 font-medium cursor-pointer shadow-xs"
                >
                  {isUpdatingStage ? "Saving..." : "Update CRM Stage"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* SECTION: Quick Follow-Up Scheduler */}
        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] space-y-3 shadow-xs relative overflow-hidden">
          <div className="border-b border-white/[0.06] pb-2.5">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Schedule Follow-Up Task
            </h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Keep callback promises or organize future review touches for this prospect.
            </p>
          </div>

          {taskSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
              <span>{taskSuccess}</span>
              <button type="button" onClick={() => setTaskSuccess(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
            </div>
          )}

          {taskError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
              <span>{taskError}</span>
              <button type="button" onClick={() => setTaskError(null)} className="text-rose-400 hover:text-rose-200">✕</button>
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
                className="w-full h-8.5 px-3 bg-[#09090e] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs"
              />
              <input
                type="datetime-local"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                disabled={isCreatingTask}
                className="w-full h-8.5 px-3 bg-[#09090e] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs"
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={!taskTitle.trim() || isCreatingTask}
                className="h-8 px-3.5 text-xs bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] cursor-pointer"
              >
                {isCreatingTask ? "Saving..." : "+ Add Follow-Up"}
              </Button>
            </div>
          </form>
        </div>

        {/* SECTION: Unified Activity Timeline */}
        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/[0.08] shadow-xs">
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
