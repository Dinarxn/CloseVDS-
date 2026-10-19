/**
 * closeVDS CRM Pipeline & Deal Tracking Domain Types
 * Phase 5 Sales Operations & Pipeline Progression
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

export type CanonicalLeadStatus =
  | "DISCOVERED"
  | "IMPORTED"
  | "NEW"
  | "RESEARCH_PENDING"
  | "RESEARCHED"
  | "QUALIFICATION_PENDING"
  | "QUALIFIED"
  | "CALL_READY"
  | "CONTACTED"
  | "REPLIED"
  | "INTERESTED"
  | "MEETING"
  | "WON"
  | "LOST"
  | "DISQUALIFIED"
  | "OPT_OUT";

/**
 * Authoritative Backend Lead Stage Transition Matrix.
 * Enforced on the backend; mirrors CRMService ALLOWED_STAGE_TRANSITIONS.
 */
export const ALLOWED_STAGE_TRANSITIONS: Record<CanonicalLeadStatus, CanonicalLeadStatus[]> = {
  DISCOVERED: ["IMPORTED", "RESEARCH_PENDING", "DISQUALIFIED", "OPT_OUT"],
  IMPORTED: ["RESEARCH_PENDING", "RESEARCHED", "DISQUALIFIED", "OPT_OUT"],
  NEW: ["DISCOVERED", "IMPORTED", "RESEARCH_PENDING", "QUALIFIED", "DISQUALIFIED", "CONTACTED", "OPT_OUT"],
  RESEARCH_PENDING: ["RESEARCHED", "QUALIFICATION_PENDING", "DISQUALIFIED", "OPT_OUT"],
  RESEARCHED: ["QUALIFICATION_PENDING", "QUALIFIED", "DISQUALIFIED", "OPT_OUT"],
  QUALIFICATION_PENDING: ["QUALIFIED", "DISQUALIFIED", "CALL_READY", "OPT_OUT"],
  QUALIFIED: ["CALL_READY", "CONTACTED", "DISQUALIFIED", "OPT_OUT"],
  DISQUALIFIED: ["QUALIFIED", "RESEARCH_PENDING", "OPT_OUT"],
  CALL_READY: ["CONTACTED", "QUALIFIED", "DISQUALIFIED", "OPT_OUT"],
  CONTACTED: ["INTERESTED", "REPLIED", "MEETING", "LOST", "QUALIFIED", "DISQUALIFIED", "OPT_OUT"],
  REPLIED: ["INTERESTED", "MEETING", "LOST", "QUALIFIED", "DISQUALIFIED", "OPT_OUT", "CONTACTED"],
  INTERESTED: ["MEETING", "WON", "LOST", "DISQUALIFIED", "OPT_OUT"],
  MEETING: ["WON", "LOST", "INTERESTED", "DISQUALIFIED", "OPT_OUT"],
  WON: ["LOST", "OPT_OUT"],
  LOST: ["INTERESTED", "QUALIFIED", "DISQUALIFIED", "OPT_OUT"],
  OPT_OUT: [],
};

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
  contactEmail?: string;
  contactPhone?: string;
  valueEstimate?: number;
  stage: CrmStageId;
  rawStatus: CanonicalLeadStatus | string;
  qualificationScore?: number;
  leadSource?: string;
  ownerName?: string;
  lastTouchDate?: string;
  nextFollowUpDate?: string;
  notesCount?: number;
  latestActivityDescription?: string;
}

export type CRMActivityType =
  | "STAGE_CHANGE"
  | "NOTE"
  | "CALL_LOG"
  | "EMAIL_SENT"
  | "EMAIL_REPLIED";

export interface CRMActivity {
  id: string;
  leadId: string;
  userId?: string | null;
  type: CRMActivityType;
  description: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface LeadCRMProfileResponse {
  success: boolean;
  lead: import("@/lib/mappers").BackendLead;
  activities: CRMActivity[];
  dealSizeEstimate?: number;
}
