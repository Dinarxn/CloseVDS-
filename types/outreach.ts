/**
 * closeVDS Outreach & Permission Gate Domain Types
 * Phase 1 Frontend Foundation
 */

export type OutreachStage = "pending_approval" | "approved_queue" | "sent_active" | "suppressed";

export type OutreachChannel = "email" | "whatsapp" | "multi_channel";

export type MessageTouchType = "initial_touch" | "follow_up_1" | "follow_up_2" | "breakup_touch";

export interface OutreachDraft {
  id: string;
  leadId: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  channel: OutreachChannel;
  touchType: MessageTouchType;
  touchNumber: number;
  subjectLine: string;
  openingHook: string;
  bodyContent: string;
  callToAction: string;
  observedFacts: string[];
  qualificationScore: number;
  qualificationReasoning: string;
  stage: OutreachStage;
  preparedAt: string;
  approvedAt?: string;
  sentAt?: string;
}

export interface OutreachFilterState {
  search: string;
  channel: string;
  touchType: string;
  minScore: number;
}
