import React from "react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { LeadStatus, QualificationStatus } from "@/types/leads";

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
