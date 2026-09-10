"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export interface KillSwitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  onConfirmToggle: () => void;
}

export function KillSwitchDialog({
  isOpen,
  onClose,
  isActive,
  onConfirmToggle,
}: KillSwitchDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isActive ? "Deactivate Global Emergency Kill Switch?" : "ACTIVATE GLOBAL EMERGENCY KILL SWITCH?"}
      description={
        isActive
          ? "Resuming normal system operations will allow queued and approved dispatches to proceed within configured sending windows."
          : "Activating the Emergency Kill Switch will instantly halt all outbound sequences, pause sending queues, and reject new automated dispatches across all acquisition queues."
      }
    >
      <div className="space-y-4 text-xs">
        <Alert variant={isActive ? "default" : "destructive"} title="Global Outreach Impact">
          {isActive
            ? "Normal velocity rules and Gate 2 explicit approval requirements will resume."
            : "All outbound message transmission will be blocked immediately. In Phase 1 foundation mode, this demonstrates the safety boundary state."}
        </Alert>

        <div className="p-3 bg-[#0a0a0a] border border-[#404040] rounded-md space-y-1 text-[#d4d4d4]">
          <p className="font-semibold text-white">Safety Checklist:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#737373]">
            <li>Active outbound queues will be paused</li>
            <li>No automated follow-up dispatches will execute</li>
            <li>Inbound reply webhooks will continue to monitor opt-outs</li>
          </ul>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#404040]/40">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isActive ? "primary" : "destructive"}
            size="sm"
            onClick={() => {
              onConfirmToggle();
              onClose();
            }}
            className="font-bold"
          >
            {isActive ? "Confirm: Resume Operations" : "Confirm: ACTIVATE KILL SWITCH"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
