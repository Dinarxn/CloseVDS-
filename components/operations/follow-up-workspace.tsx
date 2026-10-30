"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  PlusIcon,
  SearchIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  BuildingIcon,
  UserIcon,
  TrashIcon,
  AlertCircleIcon,
  FileTextIcon,
} from "@/components/ui/icons";
import { api, ApiClientError } from "@/lib/api-client";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import { CreateTaskModal } from "./create-task-modal";
import { RescheduleTaskModal } from "./reschedule-task-modal";
import type { FollowUpTaskItem, TaskStatus } from "@/types/follow-ups";

export interface FollowUpWorkspaceProps {
  onTaskChange?: () => void;
}

type FilterTab = "PENDING" | "DUE_TODAY" | "OVERDUE" | "COMPLETED" | "ALL";
type DueState = "OVERDUE" | "DUE_TODAY" | "UPCOMING" | "NO_DATE" | "COMPLETED";

export function FollowUpWorkspace({ onTaskChange }: FollowUpWorkspaceProps) {
  const [tasks, setTasks] = useState<FollowUpTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtering & Search
  const [activeFilter, setActiveFilter] = useState<FilterTab>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<FollowUpTaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<FollowUpTaskItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<string | null>(null);

  // In-flight action tracking (for single task status update)
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

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Helper: compute due state
  const getTaskDueState = useCallback((task: FollowUpTaskItem): DueState => {
    if (task.status === "COMPLETED") return "COMPLETED";
    if (!task.dueDate) return "NO_DATE";
    const due = new Date(task.dueDate);
    if (isNaN(due.getTime())) return "NO_DATE";
    const now = new Date();
    if (due < now) return "OVERDUE";

    // Due today check (same calendar day)
    if (
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate()
    ) {
      return "DUE_TODAY";
    }

    return "UPCOMING";
  }, []);

  // Compute Priority
  const getTaskPriority = useCallback(
    (task: FollowUpTaskItem, dueState: DueState): { label: string; variant: "danger" | "warning" | "brand" | "secondary" } => {
      if (dueState === "OVERDUE") {
        return { label: "URGENT", variant: "danger" };
      }
      if (dueState === "DUE_TODAY") {
        return { label: "HIGH", variant: "warning" };
      }
      if (task.status === "COMPLETED") {
        return { label: "RESOLVED", variant: "secondary" };
      }
      return { label: "NORMAL", variant: "brand" };
    },
    []
  );

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      PENDING: tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length,
      DUE_TODAY: tasks.filter((t) => getTaskDueState(t) === "DUE_TODAY").length,
      OVERDUE: tasks.filter((t) => getTaskDueState(t) === "OVERDUE").length,
      COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
      ALL: tasks.length,
    };
  }, [tasks, getTaskDueState]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search matching
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matches =
          t.title.toLowerCase().includes(query) ||
          t.leadBusinessName.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query));

        if (!matches) return false;
      }

      const dueState = getTaskDueState(t);

      if (activeFilter === "ALL") return true;
      if (activeFilter === "PENDING") {
        return t.status === "PENDING" || t.status === "IN_PROGRESS";
      }
      if (activeFilter === "DUE_TODAY") {
        return dueState === "DUE_TODAY";
      }
      if (activeFilter === "OVERDUE") {
        return dueState === "OVERDUE";
      }
      if (activeFilter === "COMPLETED") {
        return t.status === "COMPLETED";
      }
      return true;
    });
  }, [tasks, searchQuery, activeFilter, getTaskDueState]);

  // Handle Complete / Incomplete toggle
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

  // Handle Delete task
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.followUps.delete(taskToDelete.id);
      setTaskToDelete(null);
      await loadTasks();
      onTaskChange?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to delete follow-up task.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDueDate = (raw: string | Date | null) => {
    if (!raw) return "No due date";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw);
      return (
        d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        " at " +
        d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch {
      return String(raw);
    }
  };

  return (
    <div className="space-y-4">
      {/* Workspace Controls: Filter Tabs + Search + Create */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-panel border border-white/[0.08] p-3.5 rounded-xl shadow-xs relative overflow-hidden">
        {/* Specular hairline */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "PENDING", label: "Active & Pending" },
              { id: "DUE_TODAY", label: "Due Today" },
              { id: "OVERDUE", label: "Overdue" },
              { id: "COMPLETED", label: "Completed" },
              { id: "ALL", label: "All Tasks" },
            ] as const
          ).map((tab) => {
            const count = tabCounts[tab.id];
            const isOverdueTab = tab.id === "OVERDUE" && count > 0;
            const isActive = activeFilter === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#7D39EB] text-white font-semibold shadow-xs border border-[#8F52F5]"
                    : isOverdueTab
                    ? "bg-rose-950/30 text-rose-300 hover:bg-rose-900/40 border border-rose-500/30"
                    : "bg-surface-canvas text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-white/[0.08]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium tabular-nums ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : isOverdueTab
                      ? "bg-rose-500/20 text-rose-300 font-semibold"
                      : "bg-white/[0.06] text-zinc-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar + Create Action */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tasks, companies, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 bg-surface-canvas text-white text-xs rounded-lg border border-white/[0.10] placeholder:text-zinc-500 focus:outline-none focus:border-[#7D39EB] focus:ring-1 focus:ring-[#7D39EB] transition-colors shadow-xs"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <SearchIcon size={14} />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-500 hover:text-zinc-300 text-xs"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="sm"
            className="h-9 px-3.5 gap-1.5 shrink-0"
          >
            <PlusIcon size={14} />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2 shadow-xs">
          <AlertCircleIcon size={16} className="text-rose-400 mt-0.5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Tasks Content List */}
      {isLoading ? (
        <div className="p-14 text-center border border-white/[0.08] rounded-xl bg-surface-panel shadow-xs space-y-3">
          <div className="w-6 h-6 border-2 border-[#7D39EB] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Loading follow-up tasks from workspace...
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title={
            activeFilter === "OVERDUE"
              ? "No Overdue Tasks"
              : activeFilter === "DUE_TODAY"
              ? "No Tasks Due Today"
              : activeFilter === "COMPLETED"
              ? "No Completed Tasks Recorded"
              : searchQuery
              ? "No Matching Tasks Found"
              : "No Follow-Up Tasks"
          }
          description={
            activeFilter === "OVERDUE"
              ? "All pending follow-ups are up to date. No overdue items require operator attention."
              : activeFilter === "DUE_TODAY"
              ? "No follow-up touches are scheduled for today. Check upcoming tasks or schedule a new one."
              : searchQuery
              ? `No follow-ups match query "${searchQuery}". Clear your search or broaden filters.`
              : "Create follow-up tasks to organize callback commitments, outreach reviews, or discovery touchpoints."
          }
          icon={<FileTextIcon size={22} className="text-[#7D39EB]" />}
          action={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
              size="sm"
              className="gap-1.5"
            >
              <PlusIcon size={14} />
              <span>Create Follow-Up Task</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const dueState = getTaskDueState(task);
            const priority = getTaskPriority(task, dueState);
            const isActing = actionInProgressId === task.id;
            const isCompleted = task.status === "COMPLETED";

            return (
              <div
                key={task.id}
                className={`p-4 bg-surface-card border rounded-xl transition-all duration-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative overflow-hidden group ${
                  isCompleted
                    ? "border-white/[0.05] opacity-80 hover:opacity-100 hover:border-white/[0.12]"
                    : "border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-card-hover"
                }`}
              >
                {/* Left-edge specular status line */}
                {dueState === "OVERDUE" && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#F43F5E] pointer-events-none" />
                )}
                {dueState === "DUE_TODAY" && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#F59E0B] pointer-events-none" />
                )}
                {dueState === "COMPLETED" && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#C6FF33]/60 pointer-events-none" />
                )}
                {dueState === "UPCOMING" && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#7D39EB]/40 pointer-events-none" />
                )}

                <div className="space-y-1.5 flex-1 min-w-0 pl-1.5">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status badge */}
                    {isCompleted ? (
                      <Badge variant="success" size="sm" dot={true}>
                        COMPLETED
                      </Badge>
                    ) : task.status === "IN_PROGRESS" ? (
                      <Badge variant="brand" size="sm" dot={true}>
                        IN PROGRESS
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot={false}>
                        PENDING
                      </Badge>
                    )}

                    {/* Semantic due badge */}
                    {dueState === "OVERDUE" && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-500/30 uppercase">
                        Overdue
                      </span>
                    )}
                    {dueState === "DUE_TODAY" && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/30 uppercase">
                        Due Today
                      </span>
                    )}

                    {/* Priority badge */}
                    <Badge variant={priority.variant} size="sm">
                      {priority.label}
                    </Badge>

                    {/* Associated company/lead button */}
                    <button
                      type="button"
                      onClick={() => setSelectedLeadForDetail(task.leadId)}
                      className="text-xs font-mono text-zinc-300 hover:text-[#B788FF] transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <BuildingIcon size={13} className="text-zinc-500 group-hover:text-[#7D39EB] transition-colors shrink-0" />
                      <span className="underline decoration-white/20 underline-offset-2">{task.leadBusinessName}</span>
                    </button>
                  </div>

                  {/* Task Title */}
                  <h4
                    className={`text-sm font-semibold tracking-tight truncate ${
                      isCompleted ? "text-zinc-400 line-through" : "text-white group-hover:text-[#B788FF] transition-colors"
                    }`}
                  >
                    {task.title}
                  </h4>

                  {/* Task Description */}
                  {task.description && (
                    <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-400 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <ClockIcon size={12} className="text-zinc-500" />
                      <span>
                        Target:{" "}
                        <strong
                          className={
                            dueState === "OVERDUE"
                              ? "text-rose-400 font-semibold"
                              : dueState === "DUE_TODAY"
                              ? "text-amber-300 font-semibold"
                              : "text-zinc-300 font-normal"
                          }
                        >
                          {formatDueDate(task.dueDate)}
                        </strong>
                      </span>
                    </span>

                    {task.assignedUserName && (
                      <span className="flex items-center gap-1">
                        <UserIcon size={12} className="text-zinc-500" />
                        <span>Assignee:</span>
                        <strong className="text-zinc-300 font-medium">{task.assignedUserName}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Operations Controls */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.05]">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLeadForDetail(task.leadId)}
                    className="h-8 px-2.5 text-xs text-zinc-300 hover:text-white"
                  >
                    <span>View Lead</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRescheduleTarget(task)}
                    className="h-8 px-2.5 text-xs text-zinc-300 hover:text-white gap-1"
                  >
                    <CalendarIcon size={12} />
                    <span>Reschedule</span>
                  </Button>

                  <Button
                    size="sm"
                    variant={isCompleted ? "secondary" : "primary"}
                    onClick={() => handleToggleComplete(task)}
                    disabled={isActing}
                    isLoading={isActing}
                    className={`h-8 px-3 text-xs gap-1.5 ${
                      isCompleted ? "text-zinc-300" : ""
                    }`}
                  >
                    <CheckIcon size={13} className={isCompleted ? "text-zinc-400" : "text-white"} />
                    <span>{isCompleted ? "Re-open" : "Mark Complete"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTaskToDelete(task)}
                    disabled={isActing}
                    className="h-8 px-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Delete task"
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onTaskCreated={() => {
          loadTasks();
          onTaskChange?.();
        }}
      />

      {/* Reschedule Task Modal */}
      <RescheduleTaskModal
        open={!!rescheduleTarget}
        onOpenChange={(open) => !open && setRescheduleTarget(null)}
        task={rescheduleTarget}
        onRescheduled={() => {
          loadTasks();
          onTaskChange?.();
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
        title="Delete Follow-Up Task"
        description={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}" for ${taskToDelete.leadBusinessName}? This action cannot be undone.`
            : "Delete this task?"
        }
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />

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
