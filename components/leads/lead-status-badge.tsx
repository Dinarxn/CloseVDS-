import React from "react";
import {
  DataQuality,
  LeadActionability,
  LeadStatus,
  MapsMatchStatus,
  QualificationStatus,
  ServiceRecommendation,
} from "@/types/leads";

export interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const statusLabels: Record<
    LeadStatus,
    { label: string; dotColor?: string; textColor: string; bgClass: string; dot: boolean }
  > = {
    discovered: { label: "Discovered", dotColor: "bg-zinc-400", textColor: "text-zinc-300", bgClass: "bg-white/[0.04] border-white/[0.07]", dot: true },
    analyzing: { label: "Auditing", dotColor: "bg-amber-400", textColor: "text-amber-300", bgClass: "bg-amber-500/[0.08] border-amber-500/20", dot: true },
    qualified: { label: "Qualified", dotColor: "bg-emerald-400", textColor: "text-emerald-300", bgClass: "bg-emerald-500/[0.08] border-emerald-500/20", dot: true },
    disqualified: { label: "Disqualified", textColor: "text-zinc-500", bgClass: "bg-white/[0.02] border-white/[0.05]", dot: false },
    outreach_ready: { label: "Call Ready", dotColor: "bg-sky-400", textColor: "text-sky-300", bgClass: "bg-sky-500/[0.08] border-sky-500/20", dot: true },
    contacted: { label: "Contacted", dotColor: "bg-indigo-400", textColor: "text-indigo-300", bgClass: "bg-indigo-500/[0.08] border-indigo-500/20", dot: true },
    in_followup: { label: "In Follow-up", dotColor: "bg-amber-400", textColor: "text-amber-300", bgClass: "bg-amber-500/[0.08] border-amber-500/20", dot: true },
    replied: { label: "Replied", dotColor: "bg-emerald-400", textColor: "text-emerald-300", bgClass: "bg-emerald-500/[0.08] border-emerald-500/20", dot: true },
    meeting_booked: { label: "Meeting Booked", dotColor: "bg-emerald-400", textColor: "text-emerald-300", bgClass: "bg-emerald-500/[0.08] border-emerald-500/20", dot: true },
    opted_out: { label: "Opted Out", dotColor: "bg-rose-400", textColor: "text-rose-400", bgClass: "bg-rose-500/[0.08] border-rose-500/20", dot: false },
    closed_won: { label: "Closed Won", dotColor: "bg-emerald-400", textColor: "text-emerald-300", bgClass: "bg-emerald-500/[0.08] border-emerald-500/20", dot: true },
    closed_lost: { label: "Closed Lost", textColor: "text-zinc-500", bgClass: "bg-white/[0.02] border-white/[0.05]", dot: false },
  };

  const config = statusLabels[status] || {
    label: status,
    textColor: "text-zinc-400",
    bgClass: "bg-white/[0.04] border-white/[0.07]",
    dot: false,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono tracking-tight font-medium ${config.bgClass} ${config.textColor}`}
    >
      {config.dot && (
        <span className={`w-1 h-1 rounded-full shrink-0 ${config.dotColor || "bg-current"}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export interface QualificationBadgeProps {
  qualification?: QualificationStatus;
  score?: number;
}

export function QualificationBadge({ qualification, score }: QualificationBadgeProps) {
  if (score !== undefined) {
    const isHigh = score >= 80;
    const isQualified = score >= 70;
    const isModerate = score >= 50;

    const colorClasses = isHigh || isQualified
      ? "text-emerald-300 bg-emerald-500/[0.08] border-emerald-500/20"
      : isModerate
      ? "text-amber-300 bg-amber-500/[0.08] border-amber-500/20"
      : "text-zinc-400 bg-white/[0.03] border-white/[0.06]";

    const dotColor = isHigh || isQualified
      ? "bg-emerald-400"
      : isModerate
      ? "bg-amber-400"
      : "bg-zinc-500";

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono tabular-nums font-medium ${colorClasses}`}
      >
        <span className={`w-1 h-1 rounded-full shrink-0 ${dotColor}`} />
        <span>Score {score}/100</span>
      </span>
    );
  }

  const qualLabels: Record<
    QualificationStatus,
    { label: string; textColor: string; bgClass: string; dot?: boolean; dotColor?: string }
  > = {
    unqualified: { label: "Unqualified", textColor: "text-zinc-500", bgClass: "bg-white/[0.02] border-white/[0.05]", dot: false },
    needs_review: { label: "Needs Review", textColor: "text-amber-300", bgClass: "bg-amber-500/[0.08] border-amber-500/20", dot: true, dotColor: "bg-amber-400" },
    qualified: { label: "Qualified", textColor: "text-emerald-300", bgClass: "bg-emerald-500/[0.08] border-emerald-500/20", dot: true, dotColor: "bg-emerald-400" },
    high_priority: { label: "High Priority", textColor: "text-emerald-300", bgClass: "bg-emerald-500/[0.12] border-emerald-500/25", dot: true, dotColor: "bg-emerald-400" },
  };

  const config = qualification
    ? qualLabels[qualification]
    : { label: "Unscored", textColor: "text-zinc-400", bgClass: "bg-white/[0.03] border-white/[0.07]", dot: false };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono tracking-tight font-medium ${config.bgClass} ${config.textColor}`}
    >
      {config.dot && (
        <span className={`w-1 h-1 rounded-full shrink-0 ${config.dotColor || "bg-current"}`} />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export interface ServiceRecommendationBadgeProps {
  recommendation?: ServiceRecommendation;
  compact?: boolean;
}

export function ServiceRecommendationBadge({
  recommendation,
  compact = false,
}: ServiceRecommendationBadgeProps) {
  if (!recommendation) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.2 rounded border text-[9px] font-mono text-zinc-500 bg-white/[0.02] border-white/[0.05]">
        Not evaluated
      </span>
    );
  }

  const hasOpp = recommendation.serviceOpportunity === "YES";
  const isNoneService = recommendation.recommendedService === "NONE";

  return (
    <div className={`flex flex-col ${compact ? "gap-0.5" : "gap-1"}`}>
      <div className="flex items-center gap-1.5">
        {hasOpp ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
            OPP: YES
          </span>
        ) : (
          <span className="inline-flex items-center text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-white/[0.03] text-zinc-500 border border-white/[0.06]">
            OPP: NONE
          </span>
        )}
      </div>
      <div
        className={`leading-tight truncate max-w-[190px] ${
          isNoneService
            ? "text-zinc-500 font-mono text-[11px]"
            : hasOpp
            ? "text-zinc-200 font-medium text-xs"
            : "text-zinc-400 text-xs font-normal"
        }`}
        title={recommendation.recommendedService}
      >
        {recommendation.recommendedService}
      </div>
    </div>
  );
}

export interface DataQualityBadgeProps {
  quality?: DataQuality;
}

export function DataQualityBadge({ quality }: DataQualityBadgeProps) {
  if (!quality) return null;

  const isGood = quality === "COMPLETE" || quality === "GOOD";
  const isPartial = quality === "PARTIAL";

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] font-mono uppercase tracking-wider font-medium ${
        isGood
          ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
          : isPartial
          ? "bg-amber-500/[0.08] border-amber-500/20 text-amber-400"
          : "bg-white/[0.03] border-white/[0.06] text-zinc-500"
      }`}
      title={`Data Quality: ${quality}`}
    >
      <span className={`w-1 h-1 rounded-full shrink-0 ${isGood ? "bg-emerald-400" : isPartial ? "bg-amber-400" : "bg-zinc-500"}`} />
      <span>{quality}</span>
    </span>
  );
}

export interface MapsMatchStatusBadgeProps {
  status?: MapsMatchStatus;
}

export function MapsMatchStatusBadge({ status }: MapsMatchStatusBadgeProps) {
  if (!status) return null;

  const isTargeted = status === "TARGETED";

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] font-mono uppercase font-medium ${
        isTargeted
          ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
          : "bg-white/[0.03] border-white/[0.06] text-zinc-500"
      }`}
      title={`Maps Match Status: ${status}`}
    >
      {isTargeted && <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />}
      <span>Maps: {status}</span>
    </span>
  );
}

export interface ActionabilityBadgeProps {
  actionability?: LeadActionability;
  compact?: boolean;
}

export function ActionabilityBadge({
  actionability,
  compact = false,
}: ActionabilityBadgeProps) {
  if (!actionability) return null;

  const isReady = actionability.tier === "READY";
  const isEnrichment = actionability.tier === "ENRICHMENT_REQUIRED";
  const tierLabel = actionability.tier.replace(/_/g, " ");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] font-mono uppercase tracking-wider font-medium ${
          isReady
            ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
            : isEnrichment
            ? "bg-amber-500/[0.08] border-amber-500/20 text-amber-400"
            : "bg-white/[0.03] border-white/[0.06] text-zinc-500"
        }`}
        title={
          actionability.reasons && actionability.reasons.length > 0
            ? actionability.reasons.join(" • ")
            : tierLabel
        }
      >
        {actionability.isActionable && (
          <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
        )}
        <span>{tierLabel}</span>
      </span>

      {!compact &&
        actionability.eligibleChannels &&
        actionability.eligibleChannels.length > 0 && (
          <div className="flex items-center gap-1">
            {actionability.eligibleChannels.map((channel) => (
              <span
                key={channel}
                className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/[0.03] text-zinc-400 border border-white/[0.05]"
                title={`Eligible channel: ${channel}`}
              >
                {channel === "WEBSITE_AUDIT" ? "AUDIT" : channel}
              </span>
            ))}
          </div>
        )}
    </div>
  );
}
