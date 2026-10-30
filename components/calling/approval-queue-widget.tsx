"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CallWithRelations } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { CallStatusBadge } from "./call-status-badge";
import { CallRejectModal } from "./call-reject-modal";
import { useToast } from "@/hooks/use-toast";

export interface ApprovalQueueWidgetProps {
  pendingCalls: CallWithRelations[];
  isLoading?: boolean;
  onActionComplete: () => void;
  onCheckSafety?: (call: CallWithRelations) => void;
}

export function ApprovalQueueWidget({
  pendingCalls = [],
  isLoading = false,
  onActionComplete,
  onCheckSafety,
}: ApprovalQueueWidgetProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rejectingCall, setRejectingCall] = useState<CallWithRelations | null>(null);
  const { addToast } = useToast();

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setErrorMsg(null);
    try {
      await api.voice.approveCall(id);
      addToast({
        title: "Call Approved",
        description: "Call moved to verified approved queue ready for manual dispatch.",
        variant: "success",
      });
      onActionComplete();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to approve call.");
      }
      addToast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Failed to approve call.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!rejectingCall) return;
    setProcessingId(rejectingCall.id);
    setErrorMsg(null);
    try {
      await api.voice.rejectCall(rejectingCall.id, reason);
      addToast({
        title: "Call Rejected",
        description: "Call disqualified and removed from outbound queue.",
        variant: "warning",
      });
      setRejectingCall(null);
      onActionComplete();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to reject call.");
      }
      addToast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : "Failed to reject call.",
        variant: "error",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-white/[0.08] hover:border-white/[0.14] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-colors">
        {/* Top hairline highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Human Review &amp; Approval Queue
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-semibold">
              {pendingCalls.length} Awaiting Review
            </span>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-sans">
            Zero autonomous dialing: every prepared AI call requires human review and verification of factual boundaries before dispatch.
          </p>
        </div>

        <div>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-sans">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-400 font-mono">
              Checking approval queue...
            </div>
          ) : pendingCalls.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-xl bg-surface-panel border border-white/[0.06] space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-lime-500/10 border border-lime-500/20 text-[#C6FF33] flex items-center justify-center mx-auto text-xs">
                ✓
              </div>
              <p className="text-xs font-semibold text-white">Approval Queue Clear</p>
              <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed font-sans">
                All prepared calls have been approved, rejected, or dispatched. System approval gates are actively enforced.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {pendingCalls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/calling/calls/${call.id}`}
                        className="font-semibold text-white hover:text-violet-400 transition-colors"
                      >
                        {call.lead?.businessName || "Unknown Company"}
                      </Link>
                      <CallStatusBadge status={call.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2.5 flex-wrap">
                      <span>Contact: {call.contact?.fullName || "Primary"}</span>
                      <span className="text-zinc-600 font-mono">•</span>
                      <span className="font-mono text-zinc-300">{call.normalizedPhone}</span>
                      <span className="text-zinc-600 font-mono">•</span>
                      <span>Objective: {call.campaign?.targetOffer || call.campaign?.name || "Acquisition"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="h-7.5 px-2.5 rounded-lg bg-surface-elevated hover:bg-surface-panel text-[11px] font-mono text-zinc-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                      onClick={() => onCheckSafety?.(call)}
                    >
                      Safety Gates
                    </button>

                    <button
                      type="button"
                      className="h-7.5 px-2.5 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/25 text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50"
                      disabled={processingId === call.id}
                      onClick={() => setRejectingCall(call)}
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      className="h-7.5 px-3 rounded-lg bg-lime-500/15 text-[#C6FF33] hover:bg-lime-500/25 border border-lime-500/35 text-[11px] font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      disabled={processingId === call.id}
                      onClick={() => handleApprove(call.id)}
                    >
                      {processingId === call.id ? "Approving..." : "Approve Call"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CallRejectModal
        isOpen={Boolean(rejectingCall)}
        leadName={rejectingCall?.lead?.businessName}
        onClose={() => setRejectingCall(null)}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
