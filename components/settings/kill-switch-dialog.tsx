"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";

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
      <div className="relative overflow-hidden space-y-4 text-xs">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" aria-hidden="true" />

        {/* Global Impact Banner */}
        <div
          className={`p-3.5 rounded-xl border space-y-1 ${
            isActive
              ? "bg-surface-card border-white/[0.08] text-zinc-300 shadow-sm"
              : "bg-rose-950/20 border-rose-500/35 text-rose-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-3.5 h-3.5 ${isActive ? "text-[#C6FF33]" : "text-rose-400"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-wider">
              Global Outreach Impact
            </h5>
          </div>
          <p className="text-xs opacity-90 leading-relaxed pl-5.5 font-sans">
            {isActive
              ? "Normal velocity rules and Gate 2 explicit approval requirements will resume."
              : "All outbound message transmission will be blocked immediately across every channel."}
          </p>
        </div>

        {/* Safety Checklist */}
        <div className="p-3.5 bg-surface-panel border border-white/[0.08] rounded-xl space-y-2 shadow-sm">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
            Safety Checklist:
          </p>
          <ul className="space-y-1.5 text-xs text-zinc-400 font-sans">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Active outbound queues will be paused immediately</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>No automated follow-up dispatches will execute</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>Inbound reply webhooks will continue to monitor opt-outs</span>
            </li>
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.07]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white border border-white/[0.08] hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmToggle();
              onClose();
            }}
            className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer ${
              isActive
                ? "bg-[#C6FF33] hover:bg-[#B5ED28] text-black shadow-[0_0_15px_rgba(198,255,51,0.2)]"
                : "bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
            </svg>
            <span>{isActive ? "Confirm: Resume Operations" : "Confirm: ACTIVATE KILL SWITCH"}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}