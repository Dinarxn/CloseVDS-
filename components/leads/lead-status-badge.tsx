import React from "react";
import { Badge } from "@/components/ui/badge";
import { LeadStatus, QualificationStatus } from "@/types/leads";

export interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const statusLabels: Record<LeadStatus, { label: string; variant: "default" | "secondary" | "outline" | "solid" }> = {
    discovered: { label: "Discovered", variant: "outline" },
    analyzing: { label: "Auditing", variant: "secondary" },
    qualified: { label: "Qualified", variant: "solid" },
    disqualified: { label: "Disqualified", variant: "outline" },
    outreach_ready: { label: "Outreach Ready", variant: "default" },
    contacted: { label: "Contacted", variant: "default" },
    in_followup: { label: "In Follow-up", variant: "default" },
    replied: { label: "Replied", variant: "solid" },
    meeting_booked: { label: "Meeting Booked", variant: "solid" },
    opted_out: { label: "Opted Out", variant: "outline" },
    closed_won: { label: "Closed Won", variant: "solid" },
    closed_lost: { label: "Closed Lost", variant: "outline" },
  };

  const config = statusLabels[status] || { label: status, variant: "default" as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export interface QualificationBadgeProps {
  qualification?: QualificationStatus;
  score?: number;
}

export function QualificationBadge({ qualification, score }: QualificationBadgeProps) {
  if (score !== undefined) {
    const isHigh = score >= 80;
    const isQualified = score >= 70;
    return (
      <Badge variant={isHigh ? "solid" : isQualified ? "default" : "outline"}>
        Score {score}/100
      </Badge>
    );
  }

  const qualLabels: Record<QualificationStatus, { label: string; variant: "default" | "secondary" | "outline" | "solid" }> = {
    unqualified: { label: "Unqualified", variant: "outline" },
    needs_review: { label: "Needs Review", variant: "secondary" },
    qualified: { label: "Qualified", variant: "default" },
    high_priority: { label: "High Priority", variant: "solid" },
  };

  const config = qualification ? qualLabels[qualification] : { label: "Unscored", variant: "outline" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
