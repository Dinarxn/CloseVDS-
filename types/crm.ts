/**
 * closeVDS CRM Pipeline & Deal Tracking Domain Types
 * Phase 1 Frontend Foundation
 */

export type CrmStageId =
  | "discovered"
  | "qualified"
  | "outreach_approved"
  | "contacted"
  | "in_followup"
  | "meeting_booked"
  | "closed_won"
  | "closed_lost";

export interface CrmStageConfig {
  id: CrmStageId;
  label: string;
  description: string;
  isTerminal?: boolean;
}

export interface CrmDealItem {
  id: string;
  leadId: string;
  companyName: string;
  contactName?: string;
  valueEstimate?: number;
  stage: CrmStageId;
  qualificationScore?: number;
  lastTouchDate?: string;
  nextFollowUpDate?: string;
  notesCount?: number;
}
