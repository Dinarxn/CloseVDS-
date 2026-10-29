"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OutreachDraft } from "@/types/outreach";

export interface PermissionReviewCardProps {
  draft: OutreachDraft;
  onApprove: (draft: OutreachDraft) => void;
  onReject: (draftId: string) => Promise<void> | void;
  onCancel?: (draftId: string) => Promise<void> | void;
  onDispatch?: (draftId: string) => Promise<void> | void;
}

export function PermissionReviewCard({
  draft,
  onApprove,
  onReject,
  onCancel,
  onDispatch,
}: PermissionReviewCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleRejectClick = async () => {
    setIsRejecting(true);
    try {
      await onReject(draft.id);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancelClick = async () => {
    setIsCancelling(true);
    try {
      if (onCancel) {
        await onCancel(draft.id);
      } else {
        await onReject(draft.id);
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDispatchClick = async () => {
    if (!onDispatch) return;
    setIsDispatching(true);
    try {
      await onDispatch(draft.id);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <Card variant="standard" specular={true} className="space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
      <CardHeader className="mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-white tracking-tight">{draft.companyName}</CardTitle>
            <CardDescription className="text-xs text-zinc-400 font-sans mt-0.5">
              Attn: {draft.contactName} {draft.contactEmail ? `(${draft.contactEmail})` : ""}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="solid" size="sm" className="font-mono text-[10px] tabular-nums">
              Score {draft.qualificationScore}/100
            </Badge>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              Touch {draft.touchNumber}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2 text-xs border-t border-white/[0.07]">
        {/* Verified Facts & Reasoning */}
        <div className="p-3 bg-surface-panel border border-white/[0.07] rounded-xl space-y-1.5 shadow-xs">
          <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-semibold">
            Verified Audit Facts Grounding
          </span>
          <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside font-sans">
            {draft.observedFacts && draft.observedFacts.length > 0 ? (
              draft.observedFacts.map((fact, idx) => <li key={idx}>{fact}</li>)
            ) : (
              <li>Practice audit verified for direct patient acquisition</li>
            )}
          </ul>
        </div>

        {/* Draft Subject & Body */}
        <div className="space-y-2 p-3 bg-surface-panel border border-white/[0.07] rounded-xl shadow-xs">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-zinc-400">Subject:</span>
            <span className="font-medium text-white">{draft.subjectLine}</span>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
            {draft.bodyContent}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-white/[0.07] mt-2">
        {draft.stage === "pending_approval" ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRejectClick}
              disabled={isRejecting}
              className="text-xs"
            >
              {isRejecting ? "Rejecting..." : "Reject / Disqualify"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(draft)}
              className="text-xs font-semibold"
            >
              Review &amp; Approve
            </Button>
          </>
        ) : draft.stage === "approved_queue" ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelClick}
              disabled={isCancelling}
              className="text-xs text-zinc-400 hover:text-white"
            >
              {isCancelling ? "Cancelling..." : "Cancel Queue"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDispatchClick}
              disabled={isDispatching}
              className="text-xs font-semibold"
            >
              {isDispatching ? "Dispatching..." : "Dispatch Outreach"}
            </Button>
          </>
        ) : draft.stage === "sent_active" ? (
          <div className="w-full flex items-center justify-between text-xs text-emerald-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">Touchpoint Dispatched</span>
            </div>
            {draft.sentAt && (
              <span className="text-[10px] text-zinc-400 font-mono tabular-nums">
                {new Date(draft.sentAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full flex items-center gap-1.5 text-xs text-rose-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
            <span>Suppressed / Opted Out</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
