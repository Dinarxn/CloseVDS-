/**
 * closeVDS Acquisition Analytics Domain Types
 * Phase 5 Sales Operations & Analytics
 */

import type { CanonicalLeadStatus, CRMActivityType } from "./crm";

export interface DateRangeFilter {
  from?: string; // ISO 8601 string
  to?: string;   // ISO 8601 string
  campaignId?: string;
}

export interface OverviewMetrics {
  leads: {
    total: number;
    byStatus: Record<CanonicalLeadStatus | string, number>;
    qualificationRate: number; // percentage
    replyRate: number; // percentage
  };
  campaigns: {
    total: number;
    byStatus: Record<string, number>;
  };
  outreach: {
    total: number;
    draft: number;
    approved: number;
    sent: number;
    rejected: number;
    failed: number;
    approvalRate: number; // percentage
  };
  crm: {
    totalActivities: number;
    byType: Record<CRMActivityType | string, number>;
  };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

export interface PipelineStageBreakdown {
  stage: CanonicalLeadStatus | string;
  count: number;
  percentage: number;
}

export interface ScoreSummary {
  averageRelevance: number;
  averageOpportunity: number;
  averageTotalScore: number;
  distribution: {
    high: number;   // >= 75
    medium: number; // 40-74
    low: number;    // < 40
  };
}

export interface LeadsAnalytics {
  totalLeads: number;
  stages: PipelineStageBreakdown[];
  qualificationRate: number;
  replyRate: number;
  scoreSummary: ScoreSummary;
}

export interface OutreachAnalytics {
  totalOutreach: number;
  draft: number;
  approved: number;
  sent: number;
  rejected: number;
  failed: number;
  approvalRate: number;
}

export interface ActivityTrends {
  totalActivities: number;
  breakdown: Record<CRMActivityType | string, number>;
  recentActivitiesCount: number;
}

export interface VoiceAnalytics {
  totalCalls: number;
  byStatus: Record<string, number>;
  byOutcome: Record<string, number>;
  approvalRate: number;
  averageDurationSeconds: number;
  meetingsRequested: number;
  callbacksRequested: number;
  optOutCount: number;
}

export interface AcquisitionFunnelData {
  leadPool: {
    total: number;
    byStatus: Record<CanonicalLeadStatus | string, number>;
    qualified: number;
  };
  voiceQueue: {
    totalCalls: number;
    queued: number;
    approved: number;
    completed: number;
    connectRate: number;
  };
  conversions: {
    interested: number;
    meetings: number;
    won: number;
  };
}

// Backward-compatible UI types
export interface AcquisitionKpis {
  leadsDiscovered: number;
  qualificationRate: number; // percentage (0-100)
  approvedDispatches: number;
  replyRate: number; // percentage (0-100)
  meetingsBooked: number;
  clientsClosed: number;
}

export interface FunnelStageMetric {
  stageId: string;
  stageLabel: string;
  count: number;
  conversionRateFromPrevious: number; // percentage (0-100)
  description: string;
}

export type AnalyticsTimeframe = "7d" | "30d" | "90d" | "all";

export interface AnalyticsFilterState {
  timeframe: AnalyticsTimeframe;
  campaignId: string;
}
