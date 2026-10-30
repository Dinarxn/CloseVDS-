"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CRMActivity } from "@/types/crm";
import { api, ApiClientError } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

export interface OutreachActivityTimelineProps {
  leadId: string | null;
  refreshTrigger?: number;
}

export function OutreachActivityTimeline({
  leadId,
  refreshTrigger = 0,
}: OutreachActivityTimelineProps) {
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchActivities = useCallback(async (id: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.crm.getActivities(id);
      if (Array.isArray(response?.activities)) {
        setActivities(response.activities);
      } else {
        setActivities([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message || "Failed to load CRM timeline.");
      } else {
        setErrorMsg("Unable to retrieve activities.");
      }
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!leadId) {
      setActivities([]);
      return;
    }
    fetchActivities(leadId);
  }, [leadId, refreshTrigger, fetchActivities]);

  if (!leadId) return null;

  const getActivityBadge = (type: CRMActivity["type"]) => {
    switch (type) {
      case "EMAIL_SENT":
        return <Badge variant="secondary" size="sm" className="font-mono text-[10px]">Email Sent</Badge>;
      case "CALL_LOG":
        return <Badge variant="solid" size="sm" className="font-mono text-[10px] bg-[#7D39EB] text-white">Phone Call</Badge>;
      case "EMAIL_REPLIED":
        return <Badge variant="success" size="sm" className="font-mono text-[10px] bg-[#C6FF33]/15 text-[#C6FF33] border border-[#C6FF33]/30">Replied</Badge>;
      case "STAGE_CHANGE":
        return <Badge variant="warning" size="sm" className="font-mono text-[10px]">Stage Shift</Badge>;
      case "NOTE":
      default:
        return <Badge variant="outline" size="sm" className="font-mono text-[10px]">Note</Badge>;
    }
  };

  return (
    <div className="relative bg-surface-panel border border-white/[0.08] rounded-xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Specular hairline top reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shrink-0" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
            Lead CRM Outreach Timeline
          </h4>
        </div>
        <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
          {activities.length} recorded events
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-zinc-400 font-mono">
          <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading recorded outreach history...
        </div>
      ) : errorMsg ? (
        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-sans">
          {errorMsg}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-7 text-center text-xs text-zinc-400 font-sans">
          No previous outreach or activity recorded for this lead yet.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
          {activities.map((act) => (
            <div key={act.id} className="pt-2.5 first:pt-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {getActivityBadge(act.type)}
                </div>
                <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                  {new Date(act.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {act.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}