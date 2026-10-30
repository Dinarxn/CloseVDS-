"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, AlertCircleIcon } from "@/components/ui/icons";
import { api, ApiClientError } from "@/lib/api-client";
import type { FollowUpTaskItem } from "@/types/follow-ups";

export interface RescheduleTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: FollowUpTaskItem | null;
  onRescheduled: () => void;
}

export function RescheduleTaskModal({
  open,
  onOpenChange,
  task,
  onRescheduled,
}: RescheduleTaskModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize selectedDate from current task's dueDate or default to tomorrow
  useEffect(() => {
    if (task?.dueDate) {
      try {
        const d = new Date(task.dueDate);
        if (!isNaN(d.getTime())) {
          // Format as YYYY-MM-DDTHH:MM for datetime-local
          const pad = (n: number) => n.toString().padStart(2, "0");
          const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
            d.getDate()
          )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setSelectedDate(localStr);
          return;
        }
      } catch {
        // Fall through
      }
    }
    // Default to tomorrow 09:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const defStr = `${tomorrow.getFullYear()}-${pad(
      tomorrow.getMonth() + 1
    )}-${pad(tomorrow.getDate())}T09:00`;
    setSelectedDate(defStr);
    setErrorMsg(null);
  }, [task, open]);

  const handleApplyPreset = (hoursOffset: number, setTimeAt9Am = false) => {
    const target = new Date();
    if (setTimeAt9Am) {
      target.setDate(target.getDate() + Math.ceil(hoursOffset / 24));
      target.setHours(9, 0, 0, 0);
    } else {
      target.setHours(target.getHours() + hoursOffset);
    }
    const pad = (n: number) => n.toString().padStart(2, "0");
    const str = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(
      target.getDate()
    )}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
    setSelectedDate(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!selectedDate) {
      setErrorMsg("Please select a new due date and time.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isoDate = new Date(selectedDate).toISOString();
      await api.followUps.update(task.id, { dueDate: isoDate });
      onRescheduled();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to reschedule task. Please verify your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reschedule Follow-Up Task"
      description={
        task ? `Adjust target commitment for "${task.title}"` : "Set a new due date."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMsg && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2 shadow-xs">
            <AlertCircleIcon size={16} className="text-rose-400 mt-0.5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
            Quick Shift Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset(2, false)}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface-canvas border border-white/[0.08] hover:border-[#7D39EB]/50 hover:bg-[#7D39EB]/10 text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
            >
              +2 Hours
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(24, true)}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface-canvas border border-white/[0.08] hover:border-[#7D39EB]/50 hover:bg-[#7D39EB]/10 text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
            >
              Tomorrow 9am
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(48, true)}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface-canvas border border-white/[0.08] hover:border-[#7D39EB]/50 hover:bg-[#7D39EB]/10 text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
            >
              In 2 Days
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                const day = d.getDay();
                const diff = d.getDate() + ((1 + 7 - day) % 7 || 7);
                const nextMonday = new Date(d.setDate(diff));
                nextMonday.setHours(9, 0, 0, 0);
                const pad = (n: number) => n.toString().padStart(2, "0");
                setSelectedDate(
                  `${nextMonday.getFullYear()}-${pad(nextMonday.getMonth() + 1)}-${pad(
                    nextMonday.getDate()
                  )}T09:00`
                );
              }}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg bg-surface-canvas border border-white/[0.08] hover:border-[#7D39EB]/50 hover:bg-[#7D39EB]/10 text-zinc-300 hover:text-white transition-all text-center cursor-pointer"
            >
              Next Monday
            </button>
          </div>
        </div>

        {/* Custom Date Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
            <CalendarIcon size={14} className="text-[#7D39EB]" />
            <span>Target Date &amp; Time</span>
          </label>
          <div className="relative">
            <input
              type="datetime-local"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting || !selectedDate}
            isLoading={isSubmitting}
          >
            Confirm Reschedule
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
