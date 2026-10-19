/**
 * closeVDS Outreach & Engagement Domain Types
 * Phase 1 + Phase 3 Outreach System
 */

import type { Lead } from "./leads";

export type OutreachStage = "pending_approval" | "approved_queue" | "sent_active" | "suppressed";

export type OutreachChannel = "email" | "whatsapp" | "phone" | "manual" | "multi_channel";

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

export interface OutreachTemplate {
  id: string;
  title: string;
  channel: OutreachChannel;
  category: "website_audit" | "ai_receptionist" | "speed_to_lead" | "general_followup";
  subjectTemplate?: string;
  bodyTemplate: string;
  description: string;
  suggestedCallToAction: string;
}

export interface PersonalizationContext {
  businessName: string;
  contactName?: string;
  domain?: string;
  city?: string;
  phone?: string;
  email?: string;
  serviceOpportunity?: string;
  observedGaps?: string[];
  senderName?: string;
  senderCompany?: string;
}

export interface OutreachOverviewStats {
  totalDrafts: number;
  pendingApproval: number;
  approvedQueue: number;
  sentActive: number;
  suppressed: number;
  qualifiedLeadsCount: number;
}

export type CallLogOutcome =
  | "CONNECTED_INTERESTED"
  | "CONNECTED_FOLLOWUP"
  | "LEFT_VOICEMAIL"
  | "NO_ANSWER"
  | "GATEKEEPER_REJECTION"
  | "WRONG_NUMBER";

export interface CallLogPayload {
  outcome: CallLogOutcome;
  durationSeconds?: number;
  notes: string;
  followUpDate?: string;
}
