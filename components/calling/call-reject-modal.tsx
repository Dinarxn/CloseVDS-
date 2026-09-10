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

        <Input
          id="rejection-reason"
          label="Rejection Reason (Optional)"
          placeholder="e.g., Prospect requested removal, contact mismatch, unqualified niche..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isSubmitting}
          helperText="Reason will be logged in the call audit timeline."
        />

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="bg-rose-700 hover:bg-rose-600 text-white font-semibold"
          >
            {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
