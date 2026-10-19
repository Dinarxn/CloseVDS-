"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/lib/api-client";
import type { CRMActivity, CRMActivityType } from "@/types/crm";

export interface CrmActivityTimelineProps {
  leadId: string;
  leadBusinessName?: string;
  initialActivities?: CRMActivity[];
  onActivityRecorded?: (activity: CRMActivity) => void;
}

export function CrmActivityTimeline({
  leadId,
  leadBusinessName,
  initialActivities,
  onActivityRecorded,
}: CrmActivityTimelineProps) {
  const [activities, setActivities] = useState<CRMActivity[]>(initialActivities || []);
  const [isLoading, setIsLoading] = useState(!initialActivities);
  const [filterType, setFilterType] = useState<"ALL" | CRMActivityType>("ALL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Note Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState<CRMActivityType>("NOTE");

  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.crm.getActivities(leadId);
      if (Array.isArray(res?.activities)) {
        setActivities(res.activities);
      } else {
        setActivities([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to synchronize lead activities.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (!initialActivities) {
      loadActivities();
    } else {
      setActivities(initialActivities);
    }
  }, [leadId, initialActivities, loadActivities]);

  const handleRecordActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.crm.recordActivity(leadId, {
        type: newNoteType,
        description: trimmed,
        metadata: {
          source: "operator_manual_log",
          recordedAt: new Date().toISOString(),
          isConfirmed: false,
        },
      });

      if (res?.activity) {
        setActivities((prev) => [res.activity, ...prev]);
        setNewNote("");
        onActivityRecorded?.(res.activity);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to log activity record.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (filterType === "ALL") return true;
    return act.type === filterType;
  });

  const getActivityTypeMeta = (type: CRMActivityType) => {
    switch (type) {
      case "STAGE_CHANGE":
        return {
          label: "Stage Transition",
          badgeClass: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          ),
        };
      case "CALL_LOG":
        return {
          label: "Voice Outreach",
          badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          ),
        };
      case "EMAIL_SENT":
        return {
          label: "Email Dispatched",
          badgeClass: "bg-sky-500/10 text-sky-300 border-sky-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        };
      case "EMAIL_REPLIED":
        return {
          label: "Reply Received",
          badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/20",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          ),
        };
      case "NOTE":
      default:
        return {
          label: "Operator Note",
          badgeClass: "bg-white/[0.06] text-zinc-300 border-white/[0.12]",
          icon: (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        };
    }
  };

  const formatActivityDate = (raw: string) => {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return raw;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-white/[0.06]">
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span>Unified Activity Timeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
              {activities.length} total
            </span>
          </h4>
          {leadBusinessName && (
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Auditable CRM events for <span className="text-zinc-200 font-medium">{leadBusinessName}</span>
            </p>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "STAGE_CHANGE", "NOTE", "CALL_LOG", "EMAIL_SENT"] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterType(cat)}
              className={`text-[10px] font-mono uppercase px-2 py-1 rounded transition-colors ${
                filterType === cat
                  ? "bg-white text-black font-semibold shadow-xs"
                  : "bg-white/[0.03] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-white/[0.06]"
              }`}
            >
              {cat === "ALL" ? "All" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Record Activity / Note Form */}
      <form
        onSubmit={handleRecordActivity}
        className="rounded-xl border border-white/[0.08] bg-[#09090f]/90 p-3.5 space-y-3 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Log CRM Activity
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-zinc-500 mr-1">Type:</span>
            {(["NOTE", "CALL_LOG"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setNewNoteType(t)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                  newNoteType === t
                    ? "bg-white/[0.12] text-white font-medium border border-white/[0.2]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t === "NOTE" ? "Note" : "Call Log"}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={
            newNoteType === "NOTE"
              ? "Add internal operator notes, qualification context, or next action details..."
              : "Summarize call outcome, operator observations, or verbal callback agreements..."
          }
          rows={2}
          disabled={isSubmitting}
          className="w-full p-2.5 bg-[#050508] text-zinc-100 text-xs rounded-lg border border-white/[0.08] placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors shadow-inner resize-none"
        />

        <div className="flex items-center justify-between pt-0.5">
          <p className="text-[10px] text-zinc-500 italic">
            * Note is logged locally to this lead&apos;s CRM audit history.
          </p>
          <Button
            type="submit"
            size="sm"
            disabled={!newNote.trim() || isSubmitting}
            className="h-7 px-3 text-xs font-medium bg-white text-black hover:bg-zinc-200"
          >
            {isSubmitting ? "Saving..." : "Record Activity"}
          </Button>
        </div>
      </form>

      {errorMsg && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-start gap-2">
          <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Activities Timeline Feed */}
      {isLoading ? (
        <div className="p-8 text-center text-zinc-400 font-mono text-xs">
          <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading activity timeline...
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01] space-y-1">
          <p className="text-xs font-mono text-zinc-400">No activity recorded</p>
          <p className="text-[10px] text-zinc-500">
            {filterType === "ALL"
              ? "All actions, notes, outreach, and stage changes will appear here."
              : `No activity found for category ${filterType}.`}
          </p>
        </div>
      ) : (
        <div className="relative pl-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[1px] before:bg-white/[0.08]">
          {filteredActivities.map((act) => {
            const meta = getActivityTypeMeta(act.type);
            const isConfirmed = act.metadata && (act.metadata as Record<string, unknown>).isConfirmed === true;

            return (
              <div key={act.id} className="relative group">
                {/* Timeline Node Icon */}
                <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-[#0c0c12] border border-white/[0.14] flex items-center justify-center text-zinc-400 group-hover:border-white/40 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover:bg-white transition-colors" />
                </div>

                <div className="p-3 bg-[#0c0c12]/80 border border-white/[0.07] hover:border-white/[0.14] rounded-lg transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${meta.badgeClass}`}>
                        {meta.icon}
                        {meta.label}
                      </span>

                      {/* Integrity / Confirmation Badge */}
                      {act.type === "CALL_LOG" ? (
                        (() => {
                          const metaRec = act.metadata as Record<string, unknown> | undefined;
                          const outcome = metaRec?.outcome as string | undefined;
                          if (outcome) {
                            if (["COMPLETED", "MEETING_REQUESTED", "CALLBACK_REQUESTED"].includes(outcome)) {
                              return (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {outcome === "MEETING_REQUESTED"
                                    ? "Meeting Booked"
                                    : outcome === "CALLBACK_REQUESTED"
                                    ? "Callback Requested"
                                    : "Call Completed"}
                                </span>
                              );
                            }
                            if (outcome === "VOICEMAIL") {
                              return (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Voicemail
                                </span>
                              );
                            }
                            if (outcome === "NO_ANSWER" || outcome === "BUSY") {
                              return (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                  {outcome === "BUSY" ? "Line Busy" : "No Answer"}
                                </span>
                              );
                            }
                            if (outcome === "FAILED") {
                              return (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  Call Failed
                                </span>
                              );
                            }
                            return (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.12]">
                                {outcome.replace(/_/g, " ")}
                              </span>
                            );
                          }
                          if (metaRec?.callId || metaRec?.durationSeconds || metaRec?.duration) {
                            return (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.12]">
                                Telephony Session Logged
                              </span>
                            );
                          }
                          return (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                              Internal Call Log
                            </span>
                          );
                        })()
                      ) : act.type === "EMAIL_SENT" ? (
                        isConfirmed ? (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            SMTP Dispatched
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                            Draft Logged
                          </span>
                        )
                      ) : null}
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500">
                      {formatActivityDate(act.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-200 leading-relaxed font-normal whitespace-pre-wrap">
                    {act.description}
                  </p>

                  {/* Metadata Inspector if notes or transitions present */}
                  {act.metadata && Object.keys(act.metadata).length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono text-zinc-500 border-t border-white/[0.04]">
                      {Boolean(act.metadata.previousStatus && act.metadata.newStatus) ? (
                        <span>
                          Transition: <span className="text-zinc-400">{String(act.metadata.previousStatus)}</span> →{" "}
                          <span className="text-white font-medium">{String(act.metadata.newStatus)}</span>
                        </span>
                      ) : null}
                      {act.metadata.channel ? (
                        <span>Channel: {String(act.metadata.channel)}</span>
                      ) : null}
                      {act.metadata.duration ? (
                        <span>Duration: {String(act.metadata.duration)}s</span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
