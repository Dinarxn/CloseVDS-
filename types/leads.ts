/**
 * closeVDS Lead & Intelligence Domain Types
 * Phase 1 Frontend Foundation
 */

export type LeadStatus =
  | "discovered"
  | "analyzing"
  | "qualified"
  | "disqualified"
  | "outreach_ready"
  | "contacted"
  | "in_followup"
  | "replied"
  | "meeting_booked"
  | "opted_out"
  | "closed_won"
  | "closed_lost";

export type QualificationStatus = "unqualified" | "needs_review" | "qualified" | "high_priority";

export type LeadSource = "google_maps" | "domain_search" | "directory" | "inbound" | "manual_upload";

export type LeadDiscoveryProvider = "osm" | "geoapify" | "google";

export interface LeadDiscoveryQueryPayload {
  niche: string;
  location: string;
  limit: number;
  countryCode?: string;
  provider: LeadDiscoveryProvider;
}

export interface WebsiteAuditData {
  url: string;
  hasSsl: boolean;
  isMobileOptimized: boolean;
  hasBookingCta: boolean;
  hasPhoneListed: boolean;
  observedGaps: string[];
}

export interface LeadQualificationData {
  relevanceScore: number; // 0-100
  opportunityScore: number; // 0-100
  totalScore: number; // 0-100
  qualificationStatus: QualificationStatus;
  reasoning: string;
}

export type ServiceRecommendation = {
  hasOpportunity: boolean;
  serviceOpportunity: "YES" | "NONE";
  recommendedService:
    | "Website Design / Development"
    | "AI Automation"
    | "Customer Acquisition System"
    | "NONE";
  reason: string;
  evidence: string;
};

// B1 — Data Quality
export type DataQuality = "COMPLETE" | "GOOD" | "PARTIAL" | "MINIMAL";

// B3 — Maps Match Status
export type MapsMatchStatus = "TARGETED" | "UNVERIFIED";

// B4 — Actionability Tier
export type LeadActionabilityTier = "READY" | "ENRICHMENT_REQUIRED" | "ARCHIVED_WEAK";

// B4 — Eligible Channels
export type LeadEligibilityChannel = "VOICE" | "EMAIL" | "WEBSITE_AUDIT";

// B4 — Missing Fields
export type LeadMissingField = "PHONE" | "EMAIL" | "WEBSITE" | "ADDRESS" | "COORDINATES";

// B4 — Lead Actionability
export interface LeadActionability {
  tier: LeadActionabilityTier;
  isActionable: boolean;
  eligibleChannels: LeadEligibilityChannel[];
  missingFields: LeadMissingField[];
  reasons: string[];
}

export interface Lead {
  id: string;
  companyName: string;
  contactName?: string;
  contactTitle?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  source: LeadSource;
  status: LeadStatus;
  qualification?: LeadQualificationData;
  websiteAudit?: WebsiteAuditData;
  serviceRecommendation?: ServiceRecommendation;
  campaignId?: string;
  campaignName?: string;
  discoveredAt: string;
  lastActivityAt?: string;

  // B1 Intelligence
  dataQuality?: DataQuality;
  additionalPhones?: string[];
  latitude?: number;
  longitude?: number;

  // B2 Intelligence
  additionalEmails?: string[];
  additionalWebsites?: string[];
  placeDetailsEnriched?: boolean;

  // B3 Intelligence
  mapsUrl?: string;
  mapsMatchStatus?: MapsMatchStatus;
  placeId?: string;

  // B4 Actionability
  actionability?: LeadActionability;
}

export interface LeadFilterState {
  search: string;
  location: string;
  industry: string;
  companySize: string;
  status: string;
  qualification: string;
  source: string;
  campaign: string;
  minScore: number;
}

export type LeadSortOption =
  | "discovered_desc"
  | "discovered_asc"
  | "company_asc"
  | "score_desc"
  | "score_asc";

export type LeadViewMode = "table" | "cards";

export interface LeadAiResult {
  summary: string;
  intent: string;
  confidence: number;
}

export interface LeadAiQualification {
  qualified: boolean;
  reason: string;
  score: number;
}

export interface LeadAiPersonalizedMessage {
  subject?: string;
  body: string;
}

export interface LeadAiQualityCheck {
  passed: boolean;
  score: number;
  issues: string[];
}

export interface LeadAiApproval {
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
}

export interface LeadAiWorkflowResult {
  leadId: string;
  status: string;
  currentStep: string;
  aiResult?: LeadAiResult;
  qualification?: LeadAiQualification;
  personalizedMessage?: LeadAiPersonalizedMessage;
  qualityCheck?: LeadAiQualityCheck;
  approval?: LeadAiApproval;
}
