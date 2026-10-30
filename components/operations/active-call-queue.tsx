"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  PhoneIcon,
  ClockIcon,
  ChevronUpIcon,
  BuildingIcon,
  ArrowRightIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import { CallPreparationModal } from "@/components/calling/call-preparation-modal";
import type { QueueItem } from "@/types/operations";

export interface ActiveCallQueueProps {
  queueItems: QueueItem[];
  isLoading: boolean;
  actionInProgressId: string | null;
  onPrioritize: (itemId: string, currentPriority: number) => Promise<void>;
  onCancelCall: (itemId: string) => Promise<void>;
  onQueueUpdated: () => void;
}

export function ActiveCallQueue({
  queueItems,
  isLoading,
  actionInProgressId,
  onPrioritize,
  onCancelCall,
  onQueueUpdated,
}: ActiveCallQueueProps) {
  // Modal states
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<string | null>(null);
  const [leadForCallPrep, setLeadForCallPrep] = useState<string | null>(null);
  const [itemToCancel, setItemToCancel] = useState<QueueItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  function formatQueueTime(val?: string | Date) {
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

  const handleConfirmCancel = async () => {
    if (!itemToCancel) return;
    setIsCancelling(true);
    try {
      await onCancelCall(itemToCancel.id);
      setItemToCancel(null);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-surface-panel shadow-xs space-y-3">
        <div className="w-6 h-6 border-2 border-[#7D39EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Synchronizing active call queue...
        </p>
      </div>
    );
  }

  if (queueItems.length === 0) {
    return (
      <EmptyState
        title="Call Queue is Empty"
        description="No active outbound calls are currently enqueued. Approve eligible leads in the Lead Pool to prepare them for outbound queue dispatch."
        icon={<PhoneIcon size={22} className="text-[#7D39EB]" />}
        action={
          <Link href="/leads">
            <Button
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <span>View Lead Pool</span>
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
          <span className="w-2 h-2 rounded-full bg-[#7D39EB] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Outbound Dispatch Priority &amp; Sequence
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-zinc-400 bg-surface-panel px-2.5 py-0.5 rounded-lg border border-white/[0.08] tabular-nums">
            {queueItems.length} Enqueued Item{queueItems.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Queue items list */}
      <div className="space-y-2.5">
        {queueItems.map((item, index) => {
          const isActing = actionInProgressId === item.id;
          const displayPriority = item.priority || index + 1;
          const isTopPriority = displayPriority <= 3;

          return (
            <div
              key={item.id}
              className="p-4 bg-surface-card border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-card-hover rounded-xl transition-all duration-150 shadow-xs relative overflow-hidden group"
            >
              {/* Specular edge hairline */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                {/* Left: Priority Badge & Prospect Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div
                    className={`font-mono text-xs px-2.5 py-1.5 rounded-lg font-bold shrink-0 tabular-nums border text-center min-w-[42px] ${
                      isTopPriority
                        ? "bg-[#7D39EB]/20 text-white border-[#7D39EB]/40 shadow-xs"
                        : "bg-surface-canvas text-zinc-400 border-white/[0.08]"
                    }`}
                  >
                    #{displayPriority}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedLeadForDetail(item.leadId)}
                        className="text-sm font-semibold text-white truncate hover:text-[#B788FF] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <BuildingIcon size={14} className="text-zinc-500 group-hover:text-[#7D39EB] transition-colors shrink-0" />
                        <span>{item.businessName}</span>
                      </button>

                      {item.isApproved ? (
                        <Badge variant="success" size="sm" dot={true}>
                          Authorized
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm" dot={true}>
                          Pending Approval
                        </Badge>
                      )}

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400 uppercase">
                        {item.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                      <span className="font-mono text-zinc-300 flex items-center gap-1.5">
                        <PhoneIcon size={12} className="text-[#7D39EB]" />
                        <span>{item.recipientPhone}</span>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400 font-mono flex items-center gap-1.5">
                        <ClockIcon size={12} className="text-zinc-500" />
                        <span>Enqueued: {formatQueueTime(item.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.05]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPrioritize(item.id, displayPriority)}
                    disabled={isActing}
                    isLoading={isActing}
                    className="h-8 px-2.5 text-xs text-zinc-300 hover:text-white"
                    title="Bump queue priority"
                  >
                    <ChevronUpIcon size={14} className="text-[#7D39EB]" />
                    <span>Prioritize</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setLeadForCallPrep(item.leadId)}
                    className="h-8 px-3 text-xs gap-1.5 font-medium"
                  >
                    <PhoneIcon size={12} />
                    <span>Launch Call</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setItemToCancel(item)}
                    disabled={isActing}
                    className="h-8 px-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Cancel queued call"
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        open={!!itemToCancel}
        onOpenChange={(open) => !open && setItemToCancel(null)}
        title="Cancel Queued Call"
        description={
          itemToCancel
            ? `Are you sure you want to remove the outbound call to "${itemToCancel.businessName}" (${itemToCancel.recipientPhone}) from the active queue?`
            : "Cancel queued call?"
        }
        confirmLabel="Cancel Call"
        cancelLabel="Keep in Queue"
        variant="destructive"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
      />

      {/* Lead Detail Modal */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          isOpen={true}
          leadId={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
          onLeadUpdated={onQueueUpdated}
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
            onQueueUpdated();
          }}
        />
      )}
    </div>
  );
}
