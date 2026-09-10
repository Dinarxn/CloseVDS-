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
}

export function PermissionReviewCard({
  draft,
  onApprove,
  onReject,
}: PermissionReviewCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);

  const handleRejectClick = async () => {
    setIsRejecting(true);
    try {
      await onReject(draft.id);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card variant="standard" className="space-y-4">
      <CardHeader className="mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-white">{draft.companyName}</CardTitle>
            <CardDescription className="text-xs">
              Attn: {draft.contactName} {draft.contactEmail ? `(${draft.contactEmail})` : ""}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="solid" size="sm">Score {draft.qualificationScore}/100</Badge>
            <Badge variant="outline" size="sm">Touch {draft.touchNumber}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2 text-xs border-t border-white/[0.06]">
        {/* Verified Facts & Reasoning */}
        <div className="p-3 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-1.5">
          <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider font-semibold">
            Verified Audit Facts Grounding
          </span>
          <ul className="text-[11px] text-zinc-300 space-y-1 list-disc list-inside">
            {draft.observedFacts.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        </div>

        {/* Draft Subject & Body */}
        <div className="space-y-2 p-3 bg-[#0d0d12] border border-white/[0.06] rounded-xl">
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-zinc-400">Subject:</span>
            <span className="font-medium text-white">{draft.subjectLine}</span>
          </div>
          <div className="pt-2 border-t border-white/[0.04] text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {draft.bodyContent}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRejectClick}
          disabled={isRejecting}
          className="text-xs text-zinc-400 hover:text-rose-300 hover:border-rose-800/60"
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
      </CardFooter>
    </Card>
  );
}
