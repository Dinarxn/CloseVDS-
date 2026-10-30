"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export interface CallRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  leadName?: string;
}

export function CallRejectModal({
  isOpen,
  onClose,
  onConfirm,
  leadName,
}: CallRejectModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(reason.trim() || undefined);
      setReason("");
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to reject call.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setReason("");
          setErrorMsg(null);
          onClose();
        }
      }}
      title="Reject Voice Outreach Call"
      description={`Disqualify and remove this prepared call ${leadName ? `for ${leadName}` : ""} from the outbound dialling queue.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive" title="Rejection Error">
            {errorMsg}
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="reject-reason" className="text-xs font-medium text-zinc-300 block">
            Disqualification Reason (Optional)
          </label>
          <Input
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Prospect requested removal, bad data, wrong persona..."
            className="text-xs bg-surface-panel border-white/[0.08] focus:border-rose-500/50"
            disabled={isSubmitting}
          />
          <p className="text-[11px] text-zinc-400 font-sans">
            Recorded in the CRM audit trail to document why the outreach was halted.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-white/[0.08]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-500 font-semibold"
          >
            {isSubmitting ? "Disqualifying..." : "Confirm Rejection"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
