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
        return <Badge variant="solid" className="text-[10px] font-mono px-1.5 py-0 bg-sky-500/20 text-sky-300 border-sky-500/30">Email Sent</Badge>;
      case "CALL_LOG":
        return <Badge variant="solid" className="text-[10px] font-mono px-1.5 py-0 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Phone Call</Badge>;
      case "EMAIL_REPLIED":
        return <Badge variant="solid" className="text-[10px] font-mono px-1.5 py-0 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Replied</Badge>;
      case "STAGE_CHANGE":
        return <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 text-amber-300 border-amber-500/30">Stage Shift</Badge>;
      case "NOTE":
      default:
        return <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 text-zinc-400 border-white/[0.08]">Note</Badge>;
    }
  };

  return (
    <div className="bg-[#0a0a0e] border border-white/[0.08] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
            Lead CRM Outreach Timeline
          </h4>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          {activities.length} recorded events
        </span>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-zinc-500 font-mono">
          Loading recorded outreach history...
        </div>
      ) : errorMsg ? (
        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs">
          {errorMsg}
        </div>
      ) : activities.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500">
          No previous outreach or activity recorded for this lead yet.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-56 overflow-y-auto divide-y divide-white/[0.04]">
          {activities.map((act) => (
            <div key={act.id} className="pt-2 first:pt-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {getActivityBadge(act.type)}
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
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
