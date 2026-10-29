"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { OutreachDraft } from "@/types/outreach";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface PermissionApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  draft: OutreachDraft | null;
  onApproved?: (draftId: string) => void;
}

export function PermissionApprovalDialog({
  isOpen,
  onClose,
  draft,
  onApproved,
}: PermissionApprovalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addToast } = useToast();

  if (!draft) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await api.outreach.approve(draft.id);
      addToast({
        title: "Outreach Approved",
        description: `Message to ${draft.contactName} (${draft.companyName}) queued for dispatch.`,
        variant: "success",
      });
      if (onApproved) onApproved(draft.id);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message || "Failed to approve outreach draft.");
      } else {
        setErrorMsg("Failed to connect to outreach approval service.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Grant Outreach Dispatch Permission"
      description="Review and give explicit permission to enqueue this personalized outreach draft for delivery."
    >
      <div className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive" title="Approval Error">
            {errorMsg}
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Badge variant="solid" size="sm" className="font-mono text-[10px]">Gate 2 Approval</Badge>
          <span className="text-xs text-zinc-400 font-medium font-sans">{draft.companyName}</span>
        </div>

        <div className="p-3.5 bg-surface-panel border border-white/[0.08] rounded-xl space-y-2 text-xs shadow-xs">
          <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
            <span className="text-zinc-400 font-sans">Recipient:</span>
            <span className="font-semibold text-white font-sans">{draft.contactName} ({draft.companyName})</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
            <span className="text-zinc-400 font-sans">Subject:</span>
            <span className="font-medium text-white font-sans">{draft.subjectLine}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400 font-sans">Channel &amp; Touch:</span>
            <span className="font-mono text-zinc-200 capitalize text-[11px]">{draft.channel} &bull; Touch {draft.touchNumber}</span>
          </div>
        </div>

        <div className="p-3.5 bg-surface-card border border-white/[0.08] rounded-xl space-y-2 shadow-xs">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Personalized Message Body
          </h4>
          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
            {draft.bodyContent}
          </p>
        </div>

        <Alert variant="warning" title="Explicit Consent Boundary">
          By confirming, you authorize closeVDS to transition this draft from pending approval to approved queue. Outbound sending remains subject to safety gates and suppression lists.
        </Alert>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.07]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="font-semibold"
          >
            {isSubmitting ? "Approving..." : "Approve & Queue Dispatch"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
