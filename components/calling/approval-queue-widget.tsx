"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
      <Card variant="standard" className="border-amber-900/40 bg-[#121216]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <CardTitle>Human Review &amp; Approval Queue</CardTitle>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/80 font-medium">
              {pendingCalls.length} Awaiting Human Review
            </span>
          </div>
          <CardDescription>
            Zero autonomous dialling: every prepared AI call requires human review and verification of factual boundaries before dispatch.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {isLoading ? (
            <div className="py-6 text-center text-xs text-zinc-400">
              Checking approval queue...
            </div>
          ) : pendingCalls.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400 bg-[#0d0d12] rounded-xl border border-white/[0.06] space-y-1">
              <p className="font-semibold text-white">Approval Queue Clear</p>
              <p className="text-zinc-500">
                All prepared calls have been approved, rejected, or dispatched.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {pendingCalls.slice(0, 5).map((call) => (
                <div
                  key={call.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/calling/calls/${call.id}`}
                        className="font-semibold text-white hover:underline"
                      >
                        {call.lead?.businessName || "Unknown Company"}
                      </Link>
                      <CallStatusBadge status={call.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                      <span>Contact: {call.contact?.fullName || "Primary"}</span>
                      <span>•</span>
                      <span className="font-mono text-zinc-300">{call.normalizedPhone}</span>
                      <span>•</span>
                      <span>Objective: {call.campaign?.targetOffer || call.campaign?.name || "Acquisition"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-400 hover:text-white border border-white/[0.06] transition-colors cursor-pointer"
                      onClick={() => onCheckSafety?.(call)}
                    >
                      Safety Gates
                    </button>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-zinc-400 hover:text-zinc-200 border border-white/[0.06] transition-colors cursor-pointer disabled:opacity-50"
                      disabled={processingId === call.id}
                      onClick={() => setRejectingCall(call)}
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-white text-black hover:bg-zinc-200 text-[11px] font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
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
        </CardContent>
      </Card>

      <CallRejectModal
        isOpen={Boolean(rejectingCall)}
        leadName={rejectingCall?.lead?.businessName}
        onClose={() => setRejectingCall(null)}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
