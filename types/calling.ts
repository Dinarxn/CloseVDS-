/**
 * Domain TypeScript types for closeVDS AI Voice Calling Agent & n8n Integration.
 * Strictly aligned with backend Prisma models and Fastify API schemas.
 */

export type CallStatus =
  | 'QUEUED'
  | 'SAFETY_CHECKING'
  | 'APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'INITIATING'
  | 'RINGING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'FAILED'
  | 'CANCELLED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'VOICEMAIL'
  | 'OPTED_OUT';

export type CallOutcomeType =
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CALLBACK_REQUESTED'
  | 'MEETING_REQUESTED'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'VOICEMAIL'
  | 'INVALID_NUMBER'
  | 'OPTED_OUT'
  | 'DO_NOT_CALL'
  | 'FAILED';

export type CallEventType =
  | 'CALL_CREATED'
  | 'CALL_INITIATED'
  | 'CALL_RINGING'
  | 'CALL_ANSWERED'
  | 'CALL_STARTED'
  | 'CALL_MEDIA_CONNECTED'
  | 'CALL_TRANSFERRED'
  | 'CALL_COMPLETED'
  | 'CALL_FAILED'
  | 'CALL_BUSY'
  | 'CALL_NO_ANSWER'
  | 'CALL_VOICEMAIL'
  | 'CALL_CANCELLED'
  | 'CALL_OPT_OUT';

export interface VoiceAgentConfig {
  id: string;
  workspaceId: string;
  name: string;
  callObjective: string;
  openingScript: string;
  qualificationQuestions: string[];
  approvedTalkingPoints: string[];
  objectionHandling?: Record<string, string>;
  prohibitedClaims: string[];
  escalationConditions: string[];
  maxDurationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoiceAgentConfigInput {
  name: string;
  callObjective: string;
  openingScript: string;
  qualificationQuestions: string[];
  approvedTalkingPoints: string[];
  objectionHandling?: Record<string, string>;
  prohibitedClaims: string[];
  escalationConditions: string[];
  maxDurationSeconds: number;
}

export interface VoiceCampaign {
  id: string;
  workspaceId: string;
  campaignId: string;
  dailyCallCap: number;
  maxAttemptsPerLead: number;
  retryDelayMinutes: number;
  allowedCallingDays: number[];
  callingWindowStart: string;
  callingWindowEnd: string;
  recordingConsent: boolean;
  agentConfigId?: string | null;
  agentConfig?: VoiceAgentConfig | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoiceCampaignInput {
  campaignId: string;
  dailyCallCap?: number;
  maxAttemptsPerLead?: number;
  retryDelayMinutes?: number;
  allowedCallingDays?: number[];
  callingWindowStart?: string;
  callingWindowEnd?: string;
  recordingConsent?: boolean;
  agentConfigId?: string | null;
}

export interface CallAttempt {
  id: string;
  callId: string;
  attemptNumber: number;
  providerCallId?: string | null;
  status: CallStatus;
  durationSeconds?: number | null;
  failureReason?: string | null;
  isRetryable: boolean;
  startedAt: string;
  endedAt?: string | null;
}

export interface CallEvent {
  id: string;
  callId: string;
  eventType: CallEventType;
  eventPayload?: Record<string, unknown> | null;
  occurredAt: string;
}

export interface CallTranscriptTurn {
  id: string;
  callId: string;
  turnIndex: number;
  speaker: 'agent' | 'lead' | 'system';
  text: string;
  confidence?: number | null;
  timestampMs?: number | null;
  createdAt: string;
}

export interface CallOutcome {
  id: string;
  callId: string;
  outcome: CallOutcomeType;
  interestLevel: string;
  objections: string[];
  requestedFollowUp?: string | null;
  nextAction?: string | null;
  sentiment?: string | null;
  optOutDetected: boolean;
  summary: string;
  derivedFromActual: boolean;
  analyzedAt: string;
}

export interface VoiceSafetyGateEvaluation {
  gateNumber: number;
  gateName: string;
  passed: boolean;
  reason?: string;
}

export interface VoiceSafetyCheckResult {
  passed: boolean;
  blockedReason?: string;
  evaluatedGates: VoiceSafetyGateEvaluation[];
}

export interface GroundedContextSection {
  leadFacts: {
    businessName: string;
    domain?: string;
    phone: string;
    address?: string;
    contactName?: string;
    contactTitle?: string;
  };
  observedGaps: Array<{
    category: string;
    description: string;
    severity: string;
  }>;
  campaignOffer: {
    niche: string;
    targetOffer: string;
  };
  approvedTalkingPoints: string[];
  prohibitedClaims: string[];
  unknownInformation: string[];
}

export interface CallPreparationResult {
  callId: string;
  status: CallStatus;
  safetyCheck: VoiceSafetyCheckResult;
  normalizedPhone: string;
  groundedContext: GroundedContextSection;
  requiresApproval: boolean;
}

export interface CallDispatchResult {
  callId: string;
  status: CallStatus;
  providerCallId?: string;
  startedAt?: string;
  blockedReason?: string;
}

export interface CallWithRelations {
  id: string;
  workspaceId: string;
  campaignId: string;
  voiceCampaignId: string;
  leadId: string;
  contactId: string;
  agentConfigId?: string | null;
  recipientPhone: string;
  normalizedPhone: string;
  status: CallStatus;
  humanApprovalRequired: boolean;
  isApproved: boolean;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  idempotencyKey?: string | null;
  scheduledAt?: string | null;
  initiatedAt?: string | null;
  completedAt?: string | null;
  durationSeconds?: number | null;
  providerName: string;
  providerCallId?: string | null;
  blockedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  campaign?: {
    id: string;
    name: string;
    niche: string;
    targetOffer: string;
    status: string;
  };
  voiceCampaign?: VoiceCampaign;
  lead?: {
    id: string;
    businessName: string;
    domain?: string | null;
    phone?: string | null;
    address?: string | null;
    status: string;
  };
  contact?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    title?: string | null;
  };
  agentConfig?: VoiceAgentConfig | null;
  attempts?: CallAttempt[];
  events?: CallEvent[];
  transcripts?: CallTranscriptTurn[];
  outcome?: CallOutcome | null;
}

export interface ListCallsQuery {
  campaignId?: string;
  leadId?: string;
  contactId?: string;
  status?: CallStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCallsResponse {
  data: CallWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VoiceAnalyticsData {
  totalCalls: number;
  byStatus: Record<string, number>;
  byOutcome: Record<string, number>;
  approvalRate: number;
  averageDurationSeconds: number;
  meetingsRequested: number;
  callbacksRequested: number;
  optOutCount: number;
}

export interface ProviderStatusItem {
  provider: string;
  category: 'AI_LLM' | 'EMAIL_DISPATCH' | 'LEAD_SCRAPING' | 'CALLING';
  isConfigured: boolean;
  status: 'CONFIGURED' | 'NOT_CONFIGURED' | 'UNAVAILABLE' | 'ERROR';
  features: string[];
}

export interface N8nIntegrationKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  webhookUrl?: string | null;
  isActive: boolean;
  lastUsedAt?: string | null;
  createdAt: string;
}

export interface N8nCreatedKeyResult {
  integration: N8nIntegrationKey;
  apiKey: string;
}

export interface N8nWebhookDelivery {
  id: string;
  workspaceId: string;
  integrationId: string;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  statusCode?: number | null;
  status: 'DELIVERED' | 'FAILED' | 'RETRYING';
  attempts: number;
  lastError?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}
