"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, AlertCircleIcon, CalendarIcon, BuildingIcon } from "@/components/ui/icons";
import { api, ApiClientError } from "@/lib/api-client";
import type { CreateTaskInput, TaskStatus } from "@/types/follow-ups";
import type { BackendLead } from "@/lib/mappers";

export interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  initialLeadId?: string;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onTaskCreated,
  initialLeadId = "",
}: CreateTaskModalProps) {
  const [leads, setLeads] = useState<BackendLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE">("MEDIUM");

  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    try {
      const res = await api.leads.list({ limit: 100 });
      if (Array.isArray(res?.data)) {
        setLeads(res.data);
        if (!selectedLeadId && res.data.length > 0) {
          setSelectedLeadId(initialLeadId || res.data[0].id);
        }
      }
    } catch {
      // Non-blocking
    } finally {
      setIsLoadingLeads(false);
    }
  }, [initialLeadId, selectedLeadId]);

  useEffect(() => {
    if (open) {
      loadLeads();
      setErrorMsg(null);
      if (initialLeadId) {
        setSelectedLeadId(initialLeadId);
      }
    }
  }, [open, initialLeadId, loadLeads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setErrorMsg("Please select a linked lead.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please provide a task title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // If a non-medium priority is chosen, we annotate the description if desired or prepend
    const formattedDescription = description.trim();

    const payload: CreateTaskInput = {
      leadId: selectedLeadId,
      title: title.trim(),
      description: formattedDescription || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      status: "PENDING" as TaskStatus,
    };

    try {
      await api.followUps.create(payload);
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("MEDIUM");
      onTaskCreated();
      onOpenChange(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to create follow-up task. Please check server status.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Follow-Up Task"
      description="Schedule an actionable commitment linked to a qualified prospect in your pipeline."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {errorMsg && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2 shadow-xs">
            <AlertCircleIcon size={16} className="text-rose-400 mt-0.5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Lead Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BuildingIcon size={14} className="text-[#7D39EB]" />
              <span>Target Lead <span className="text-[#7D39EB]">*</span></span>
            </span>
            {isLoadingLeads && (
              <span className="text-zinc-500 text-[10px] lowercase font-normal">
                loading leads...
              </span>
            )}
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            disabled={isSubmitting || isLoadingLeads}
            className="w-full h-10 px-3 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors"
          >
            <option value="" disabled>
              Select a lead from workspace...
            </option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.businessName} — {l.status} ({l.domain || l.phone || "Active"})
              </option>
            ))}
          </select>
        </div>

        {/* Task Title */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold block">
            Task Title <span className="text-[#7D39EB]">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Follow up on AI Calling pilot proposal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-10 px-3 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] placeholder:text-zinc-500 focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors"
          />
        </div>

        {/* Grid: Priority + Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold block">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE")
              }
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors"
            >
              <option value="CRITICAL">Critical (Immediate Attention)</option>
              <option value="HIGH">High (Due Today / Escalated)</option>
              <option value="MEDIUM">Medium (Standard Follow-Up)</option>
              <option value="ROUTINE">Routine (Check-In)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
              <CalendarIcon size={14} className="text-zinc-400" />
              <span>Target Due Date</span>
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors"
            />
          </div>
        </div>

        {/* Context / Notes */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 font-semibold block">
            Context &amp; Call Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key discussion points, objection notes, or specific demo requirements..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full p-3 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] placeholder:text-zinc-500 focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
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
            disabled={isSubmitting || !selectedLeadId || !title.trim()}
            isLoading={isSubmitting}
            className="gap-1.5"
          >
            <PlusIcon size={14} />
            <span>Create Task</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
