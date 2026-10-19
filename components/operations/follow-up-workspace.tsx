"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { api, ApiClientError } from "@/lib/api-client";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import type { FollowUpTaskItem, TaskStatus, CreateTaskInput } from "@/types/follow-ups";
import type { BackendLead } from "@/lib/mappers";

export interface FollowUpWorkspaceProps {
  onTaskChange?: () => void;
}

export function FollowUpWorkspace({ onTaskChange }: FollowUpWorkspaceProps) {
  const [tasks, setTasks] = useState<FollowUpTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab & Search filter
  const [activeFilter, setActiveFilter] = useState<"ALL" | "PENDING" | "OVERDUE" | "COMPLETED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [leadsForSelect, setLeadsForSelect] = useState<BackendLead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Lead Detail Modal Inspection
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<string | null>(null);

  // Action in progress tracking
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.followUps.list({ limit: 100 });
      if (Array.isArray(res?.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to synchronize follow-up tasks from server.");
      }
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLeadsForSelection = useCallback(async () => {
    try {
      const res = await api.leads.list({ limit: 50 });
      if (Array.isArray(res?.data)) {
        setLeadsForSelect(res.data);
        if (res.data.length > 0 && !selectedLeadId) {
          setSelectedLeadId(res.data[0].id);
        }
      }
    } catch {
      // Non-blocking
    }
  }, [selectedLeadId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleOpenCreateModal = () => {
    loadLeadsForSelection();
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !taskTitle.trim()) {
      setCreateError("Please select a linked lead and enter a task title.");
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    const payload: CreateTaskInput = {
      leadId: selectedLeadId,
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      status: "PENDING",
    };

    try {
      await api.followUps.create(payload);
      setIsCreateModalOpen(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      await loadTasks();
      onTaskChange?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setCreateError(err.message);
      } else {
        setCreateError("Failed to create follow-up task.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: FollowUpTaskItem) => {
    setActionInProgressId(task.id);
    setErrorMsg(null);
    const nextStatus: TaskStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

    try {
      await api.followUps.update(task.id, { status: nextStatus });
      await loadTasks();
      onTaskChange?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update task status.");
      }
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this follow-up task?")) return;
    setActionInProgressId(taskId);
    try {
      await api.followUps.delete(taskId);
      await loadTasks();
      onTaskChange?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete follow-up task.");
      }
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filter tasks
  const now = new Date();
  const filteredTasks = tasks.filter((t) => {
    // Search matching
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leadBusinessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "ALL") return true;
    if (activeFilter === "PENDING") {
      return t.status === "PENDING" || t.status === "IN_PROGRESS";
    }
    if (activeFilter === "COMPLETED") {
      return t.status === "COMPLETED";
    }
    if (activeFilter === "OVERDUE") {
      if (t.status === "COMPLETED" || t.status === "CANCELLED") return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }
    return true;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            COMPLETED
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            IN PROGRESS
          </span>
        );
      case "CANCELLED":
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 font-medium">
            CANCELLED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
            PENDING
          </span>
        );
    }
  };

  const isTaskOverdue = (task: FollowUpTaskItem) => {
    if (task.status === "COMPLETED" || task.status === "CANCELLED") return false;
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < now;
  };

  const formatDueDate = (raw: string | Date | null) => {
    if (!raw) return "No due date";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(raw);
    }
  };

  return (
    <div className="space-y-4">
      {/* Workspace Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0c12]/90 border border-white/[0.08] p-3.5 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "PENDING", label: "Active & Pending" },
              { id: "OVERDUE", label: "Overdue" },
              { id: "COMPLETED", label: "Completed" },
              { id: "ALL", label: "All Tasks" },
            ] as const
          ).map((tab) => {
            const count = tasks.filter((t) => {
              if (tab.id === "ALL") return true;
              if (tab.id === "PENDING") return t.status === "PENDING" || t.status === "IN_PROGRESS";
              if (tab.id === "COMPLETED") return t.status === "COMPLETED";
              if (tab.id === "OVERDUE") return isTaskOverdue(t);
              return true;
            }).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/[0.06]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    activeFilter === tab.id
                      ? "bg-black/10 text-black"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Filter tasks or leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors shadow-xs"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-500">
              <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          <Button
            onClick={handleOpenCreateModal}
            size="sm"
            className="h-8.5 px-3 text-xs font-medium bg-white text-black hover:bg-zinc-200 shrink-0 shadow-xs"
          >
            + New Follow-Up
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2 shadow-xs">
          <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Task List / Feed */}
      {isLoading ? (
        <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#0c0c12]/90 shadow-xs">
          <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Loading follow-up tasks from workspace...
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-white/[0.08] rounded-xl bg-[#0c0c12]/40 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-white tracking-tight">No follow-up tasks found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {activeFilter === "OVERDUE"
              ? "All pending follow-ups are up to date. No overdue items require operator attention."
              : "Create a follow-up task to organize callback commitments, outreach reviews, or discovery touchpoints."}
          </p>
          <div className="pt-2">
            <Button
              onClick={handleOpenCreateModal}
              variant="secondary"
              size="sm"
              className="h-8 px-3.5 text-xs shadow-xs"
            >
              + Create Follow-up Task
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const overdue = isTaskOverdue(task);
            const isActing = actionInProgressId === task.id;

            return (
              <div
                key={task.id}
                className="p-4 bg-[#0c0c12]/90 border border-white/[0.08] hover:border-white/[0.16] rounded-xl transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden"
              >
                {/* Overdue accent indicator */}
                {overdue && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-rose-500 pointer-events-none" />
                )}

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(task.status)}

                    {overdue && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-semibold uppercase">
                        Overdue
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedLeadForDetail(task.leadId)}
                      className="text-xs font-mono text-zinc-400 hover:text-white transition-colors underline decoration-white/20 underline-offset-2 flex items-center gap-1 font-medium"
                    >
                      <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {task.leadBusinessName}
                    </button>
                  </div>

                  <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: <span className={overdue ? "text-rose-400 font-semibold" : "text-zinc-300"}>{formatDueDate(task.dueDate)}</span>
                    </span>

                    {task.assignedUserName && (
                      <span>Assignee: <span className="text-zinc-300">{task.assignedUserName}</span></span>
                    )}
                  </div>
                </div>

                {/* Task Operations Controls */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setSelectedLeadForDetail(task.leadId)}
                    className="h-8 px-2.5 text-xs font-mono rounded-lg border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
                  >
                    View Lead
                  </button>

                  <Button
                    onClick={() => handleToggleComplete(task)}
                    disabled={isActing}
                    size="sm"
                    variant={task.status === "COMPLETED" ? "secondary" : "primary"}
                    className={`h-8 px-3 text-xs font-medium shadow-xs ${
                      task.status === "COMPLETED"
                        ? "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.12]"
                        : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    {isActing
                      ? "Saving..."
                      : task.status === "COMPLETED"
                      ? "Re-open"
                      : "Mark Complete"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    disabled={isActing}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors rounded-md"
                    title="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal Dialog */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Schedule Follow-Up Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Create an actionable task linked to a target lead. Follow-ups help sales operators keep callback commitments and review responses.
          </p>

          {createError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{createError}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-medium">
              Linked Lead <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs"
            >
              <option value="" disabled>Select a lead from workspace...</option>
              {leadsForSelect.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName} ({l.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-medium">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Call back Dr. Smith regarding automated qualification demo"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-medium">
              Due Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-9 px-3 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-300 block font-medium">
              Description &amp; Context
            </label>
            <textarea
              rows={3}
              placeholder="Notes on conversation, key questions, or proposal details..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full p-2.5 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] focus:outline-none focus:border-white/30 transition-colors shadow-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!selectedLeadId || !taskTitle.trim() || isSubmitting}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isSubmitting ? "Creating..." : "Save Follow-Up"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Linked Lead Inspection Modal */}
      {selectedLeadForDetail && (
        <LeadDetailModal
          isOpen={true}
          leadId={selectedLeadForDetail}
          onClose={() => setSelectedLeadForDetail(null)}
          onLeadUpdated={loadTasks}
        />
      )}
    </div>
  );
}
