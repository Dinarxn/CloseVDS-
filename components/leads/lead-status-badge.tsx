import React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";
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
    { label: string; variant: BadgeProps["variant"]; dot?: boolean }
  > = {
    discovered: { label: "Discovered", variant: "secondary", dot: true },
    analyzing: { label: "Auditing", variant: "warning", dot: true },
    qualified: { label: "Qualified", variant: "success", dot: true },
    disqualified: { label: "Disqualified", variant: "outline", dot: false },
    outreach_ready: { label: "Call Ready", variant: "info", dot: true },
    contacted: { label: "Contacted", variant: "info", dot: true },
    in_followup: { label: "In Follow-up", variant: "warning", dot: true },
    replied: { label: "Replied", variant: "success", dot: true },
    meeting_booked: { label: "Meeting Booked", variant: "success", dot: true },
    opted_out: { label: "Opted Out", variant: "danger", dot: false },
    closed_won: { label: "Closed Won", variant: "success", dot: true },
    closed_lost: { label: "Closed Lost", variant: "outline", dot: false },
  };

  const config = statusLabels[status] || {
    label: status,
    variant: "default" as const,
    dot: false,
  };

  return (
    <Badge
      size="sm"
      variant={config.variant}
      dot={config.dot}
      className="font-mono text-[10px] tracking-wide"
    >
      {config.label}
    </Badge>
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

    const variant: BadgeProps["variant"] = isHigh || isQualified
      ? "success"
      : isModerate
      ? "warning"
      : "secondary";

    return (
      <Badge
        size="sm"
        variant={variant}
        dot={isHigh}
        className="font-mono text-[10px] tabular-nums"
      >
        Score {score}/100
      </Badge>
    );
  }

  const qualLabels: Record<
    QualificationStatus,
    { label: string; variant: BadgeProps["variant"]; dot?: boolean }
  > = {
    unqualified: { label: "Unqualified", variant: "secondary", dot: false },
    needs_review: { label: "Needs Review", variant: "warning", dot: true },
    qualified: { label: "Qualified", variant: "success", dot: true },
    high_priority: { label: "High Priority", variant: "success", dot: true },
  };

  const config = qualification
    ? qualLabels[qualification]
    : { label: "Unscored", variant: "outline" as const, dot: false };

  return (
    <Badge
      size="sm"
      variant={config.variant}
      dot={config.dot}
      className="font-mono text-[10px] tracking-wide"
    >
      {config.label}
    </Badge>
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
      <Badge
        size="sm"
        variant="outline"
        className="font-mono text-[9px] text-zinc-500 border-zinc-800/80 px-1.5 py-0"
      >
        Not evaluated
      </Badge>
    );
  }

  const hasOpp = recommendation.serviceOpportunity === "YES";
  const isNoneService = recommendation.recommendedService === "NONE";

  return (
    <div className={`flex flex-col ${compact ? "gap-0.5" : "gap-1"}`}>
      <div className="flex items-center gap-1.5">
        <Badge
          size="sm"
          variant={hasOpp ? "success" : "secondary"}
          dot={hasOpp}
          className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0"
        >
          {hasOpp ? "Opp: YES" : "Opp: NONE"}
        </Badge>
      </div>
      <div
        className={`text-[11px] leading-tight font-medium truncate max-w-[190px] ${
          isNoneService
            ? "text-zinc-500 font-mono"
            : hasOpp
            ? "text-zinc-200"
            : "text-zinc-400"
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

  const variant: BadgeProps["variant"] =
    quality === "COMPLETE" || quality === "GOOD"
      ? "success"
      : quality === "PARTIAL"
      ? "warning"
      : "secondary";

  return (
    <Badge
      size="sm"
      variant={variant}
      dot
      className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0"
      title={`Data Quality: ${quality}`}
    >
      {quality}
    </Badge>
  );
}

export interface MapsMatchStatusBadgeProps {
  status?: MapsMatchStatus;
}

export function MapsMatchStatusBadge({ status }: MapsMatchStatusBadgeProps) {
  if (!status) return null;

  return (
    <Badge
      size="sm"
      variant={status === "TARGETED" ? "success" : "secondary"}
      dot={status === "TARGETED"}
      className="font-mono text-[9px] uppercase px-1.5 py-0"
      title={`Maps Match Status: ${status}`}
    >
      Maps: {status}
    </Badge>
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

  const variant: BadgeProps["variant"] =
    actionability.tier === "READY"
      ? "success"
      : actionability.tier === "ENRICHMENT_REQUIRED"
      ? "warning"
      : "secondary";

  const tierLabel = actionability.tier.replace(/_/g, " ");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        size="sm"
        variant={variant}
        dot={actionability.isActionable}
        className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0"
        title={
          actionability.reasons && actionability.reasons.length > 0
            ? actionability.reasons.join(" • ")
            : tierLabel
        }
      >
        {tierLabel}
      </Badge>

      {!compact &&
        actionability.eligibleChannels &&
        actionability.eligibleChannels.length > 0 && (
          <div className="flex items-center gap-1">
            {actionability.eligibleChannels.map((channel) => (
              <span
                key={channel}
                className="text-[9px] font-mono px-1 py-0 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
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
