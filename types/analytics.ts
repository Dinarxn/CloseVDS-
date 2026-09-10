/**
 * closeVDS Acquisition Analytics Domain Types
 * Phase 1 — Step 9+ Batch
 */

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
