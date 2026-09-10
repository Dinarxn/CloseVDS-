import type { Lead, LeadStatus, QualificationStatus } from '@/types/leads';
import type { OutreachDraft, OutreachStage } from '@/types/outreach';
import type { CrmDealItem, CrmStageId } from '@/types/crm';

export interface BackendContact {
  id: string;
  leadId: string;
  fullName: string;
  email?: string;
  phone?: string;
  title?: string;
  isPrimary?: boolean;
}

export interface BackendLeadScore {
  id: string;
  leadId: string;
  relevanceScore: number;
  opportunityScore: number;
  totalScore: number;
  isQualified: boolean;
  reasoningRationale?: string;
}

export interface BackendWebsiteAudit {
  id: string;
  leadId: string;
  domain: string;
  isReachable: boolean;
  mobileOptimized: boolean;
  bookingCtaVisible: boolean;
  summary?: string;
}

export interface BackendLead {
  id: string;
  workspaceId: string;
  campaignId?: string;
  businessName: string;
  domain?: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  contacts?: BackendContact[];
  leadScore?: BackendLeadScore;
  websiteAudits?: BackendWebsiteAudit[];
  websiteAudit?: BackendWebsiteAudit;
  aiAnalysis?: {
    id: string;
    summary: string;
    opportunityPoints?: string[];
    riskFactors?: string[];
  } | null;
  campaign?: { id: string; name: string };
}

export interface BackendEmailMessage {
  id: string;
  leadId: string;
  emailCampaignId: string;
  toEmail: string;
  fromEmail: string;
  fromName: string;
  subject: string;
  bodyText: string;
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'FAILED' | 'CANCELLED';
  isApproved: boolean;
  approvedAt?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  lead?: BackendLead;
}

export function mapBackendLeadToFrontend(bLead: BackendLead): Lead {
  const primaryContact = bLead.contacts?.find((c) => c.isPrimary) || bLead.contacts?.[0];
  const score = bLead.leadScore;
  const audit = bLead.websiteAudits?.[0] || bLead.websiteAudit;

  let mappedStatus: LeadStatus = 'discovered';
  const statusStr = bLead.status.toUpperCase();
  if (statusStr === 'DISCOVERED') mappedStatus = 'discovered';
  else if (statusStr === 'AUDITING' || statusStr === 'RESEARCHED') mappedStatus = 'analyzing';
  else if (statusStr === 'QUALIFIED') mappedStatus = 'qualified';
  else if (statusStr === 'DISQUALIFIED') mappedStatus = 'disqualified';
  else if (statusStr === 'OUTREACH_READY') mappedStatus = 'outreach_ready';
  else if (statusStr === 'CONTACTED') mappedStatus = 'contacted';
  else if (statusStr === 'IN_FOLLOWUP') mappedStatus = 'in_followup';
  else if (statusStr === 'REPLIED') mappedStatus = 'replied';
  else if (statusStr === 'MEETING_BOOKED') mappedStatus = 'meeting_booked';
  else if (statusStr === 'OPT_OUT') mappedStatus = 'opted_out';
  else if (statusStr === 'CLOSED_WON') mappedStatus = 'closed_won';
  else if (statusStr === 'CLOSED_LOST') mappedStatus = 'closed_lost';

  let qualStatus: QualificationStatus = 'unqualified';
  if (score) {
    if (score.totalScore >= 80) qualStatus = 'high_priority';
    else if (score.isQualified || score.totalScore >= 70) qualStatus = 'qualified';
    else qualStatus = 'needs_review';
  }

  return {
    id: bLead.id,
    companyName: bLead.businessName,
    contactName: primaryContact?.fullName,
    contactTitle: primaryContact?.title,
    email: primaryContact?.email,
    phone: primaryContact?.phone || bLead.phone,
    website: bLead.domain ? (bLead.domain.startsWith('http') ? bLead.domain : `https://${bLead.domain}`) : undefined,
    address: bLead.address,
    city: bLead.address ? bLead.address.split(',')[0]?.trim() : undefined,
    source: 'google_maps',
    status: mappedStatus,
    campaignId: bLead.campaignId,
    campaignName: bLead.campaign?.name,
    discoveredAt: bLead.createdAt,
    lastActivityAt: bLead.updatedAt,
    qualification: score
      ? {
          relevanceScore: score.relevanceScore,
          opportunityScore: score.opportunityScore,
          totalScore: score.totalScore,
          qualificationStatus: qualStatus,
          reasoning: score.reasoningRationale || 'Fact-grounded criteria match',
        }
      : undefined,
    websiteAudit: audit
      ? {
          url: audit.domain,
          hasSsl: true,
          isMobileOptimized: audit.mobileOptimized,
          hasBookingCta: audit.bookingCtaVisible,
          hasPhoneListed: Boolean(bLead.phone),
          observedGaps: audit.summary ? [audit.summary] : [],
        }
      : undefined,
  };
}

export function mapBackendOutreachToFrontend(msg: BackendEmailMessage): OutreachDraft {
  let stage: OutreachStage = 'pending_approval';
  if (msg.status === 'APPROVED') stage = 'approved_queue';
  else if (msg.status === 'SENT') stage = 'sent_active';
  else if (msg.status === 'FAILED' || msg.status === 'CANCELLED') stage = 'suppressed';

  const lead = msg.lead;
  const primaryContact = lead?.contacts?.find((c) => c.isPrimary) || lead?.contacts?.[0];

  return {
    id: msg.id,
    leadId: msg.leadId,
    companyName: lead?.businessName || 'Target Business',
    contactName: primaryContact?.fullName || msg.toEmail.split('@')[0],
    contactEmail: msg.toEmail,
    contactPhone: lead?.phone,
    websiteUrl: lead?.domain ? `https://${lead.domain}` : undefined,
    channel: 'email',
    touchType: 'initial_touch',
    touchNumber: 1,
    subjectLine: msg.subject,
    openingHook: msg.bodyText.substring(0, 100),
    bodyContent: msg.bodyText,
    callToAction: 'Would you be open to a 3-minute walkthrough?',
    observedFacts: [lead?.businessName || 'Business Profile', 'Online booking gap'],
    qualificationScore: lead?.leadScore?.totalScore || 85,
    qualificationReasoning: lead?.leadScore?.reasoningRationale || 'Factual gap analysis confirmed opportunity score.',
    stage,
    preparedAt: msg.createdAt,
    approvedAt: msg.approvedAt,
    sentAt: msg.sentAt,
  };
}

export function mapBackendLeadToCrmDeal(bLead: BackendLead): CrmDealItem {
  const primaryContact = bLead.contacts?.find((c) => c.isPrimary) || bLead.contacts?.[0];

  let stage: CrmStageId = 'discovered';
  const statusStr = bLead.status.toUpperCase();
  if (statusStr === 'DISCOVERED' || statusStr === 'AUDITING' || statusStr === 'RESEARCHED') stage = 'discovered';
  else if (statusStr === 'QUALIFIED') stage = 'qualified';
  else if (statusStr === 'OUTREACH_READY') stage = 'outreach_approved';
  else if (statusStr === 'CONTACTED') stage = 'contacted';
  else if (statusStr === 'IN_FOLLOWUP' || statusStr === 'REPLIED') stage = 'in_followup';
  else if (statusStr === 'MEETING_BOOKED') stage = 'meeting_booked';
  else if (statusStr === 'CLOSED_WON') stage = 'closed_won';
  else if (statusStr === 'CLOSED_LOST' || statusStr === 'DISQUALIFIED' || statusStr === 'OPT_OUT') stage = 'closed_lost';

  return {
    id: `deal_${bLead.id}`,
    leadId: bLead.id,
    companyName: bLead.businessName,
    contactName: primaryContact?.fullName,
    valueEstimate: 3500,
    stage,
    qualificationScore: bLead.leadScore?.totalScore || 80,
    lastTouchDate: bLead.updatedAt,
    notesCount: 1,
  };
}

export function formatCallDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;
  if (mins === 0) return `${remainingSecs}s`;
  return `${mins}m ${remainingSecs}s`;
}

export function formatCallDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateString;
  }
}

