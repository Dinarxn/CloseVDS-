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
  sentiment?: 'positive' | 'neutral' | 'skeptical' | 'negative' | null;
  latencyMs?: number | null;
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
  recipientTimezone?: string;
  lead?: {
    id: string;
    businessName: string;
    domain?: string | null;
    status?: string;
  };
  contact?: {
    id: string;
    fullName: string;
    title?: string | null;
    phone?: string | null;
  };
  agentConfig?: {
    id: string;
    name: string;
    callObjective?: string;
  } | null;
}

export type CallMilestoneStep =
  | 'PREPARED'
  | 'APPROVED'
  | 'QUEUED'
  | 'INITIATING'
  | 'INITIATED'
  | 'RINGING'
  | 'CONNECTED'
  | 'TRANSCRIBING'
  | 'ENDED';

export interface CallTimelineMilestone {
  step: CallMilestoneStep;
  label: string;
  status: 'COMPLETED' | 'ACTIVE' | 'IN_PROGRESS' | 'PENDING' | 'FAILED' | 'SKIPPED';
  timestamp?: string | Date | null;
  durationSeconds?: number;
  actor?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CallDispatchResult {
  callId: string;
  status: CallStatus;
  providerCallId?: string;
  startedAt?: string;
  blockedReason?: string;
  idempotencyToken?: string;
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

export interface WorkspaceCallingPolicy {
  id: string;
  workspaceId: string;
  dailyCallLimit: number;
  maxConcurrentCalls: number;
  maxAttemptsPerLead: number;
  retryDelayMinutes: number;
  allowedCallingDays: number[];
  callingWindowStart: string;
  callingWindowEnd: string;
  recordingConsent: boolean;
  humanApprovalRequired: boolean;
  providerRestrictions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCallingPolicyInput {
  dailyCallLimit?: number;
  maxConcurrentCalls?: number;
  maxAttemptsPerLead?: number;
  retryDelayMinutes?: number;
  allowedCallingDays?: number[];
  callingWindowStart?: string;
  callingWindowEnd?: string;
  recordingConsent?: boolean;
  humanApprovalRequired?: boolean;
  providerRestrictions?: string[];
  isActive?: boolean;
}

// ==============================================================================
// SHARED INTEGRATION CONTRACTS & MULTI-PROVIDER ARCHITECTURE (R1)
// ==============================================================================

/**
 * Strict normalized call status shared across all telephony and voice AI providers.
 */
export type NormalizedCallStatus =
  | 'queued'
  | 'initiated'
  | 'ringing'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'busy'
  | 'no-answer'
  | 'canceled';

/**
 * Bidirectional mapping between Prisma CallStatus and NormalizedCallStatus.
 */
export function normalizeCallStatus(status: CallStatus | string): NormalizedCallStatus {
  const s = String(status).toUpperCase();
  switch (s) {
    case 'QUEUED':
    case 'SAFETY_CHECKING':
    case 'APPROVAL_REQUIRED':
    case 'APPROVED':
      return 'queued';
    case 'INITIATING':
      return 'initiated';
    case 'RINGING':
      return 'ringing';
    case 'IN_PROGRESS':
      return 'in-progress';
    case 'COMPLETED':
      return 'completed';
    case 'FAILED':
    case 'BLOCKED':
      return 'failed';
    case 'BUSY':
      return 'busy';
    case 'NO_ANSWER':
    case 'VOICEMAIL':
      return 'no-answer';
    case 'CANCELLED':
    case 'OPTED_OUT':
      return 'canceled';
    default:
      return 'failed';
  }
}

export function toPrismaCallStatus(normalized: NormalizedCallStatus | string): CallStatus {
  const n = String(normalized).toLowerCase();
  switch (n) {
    case 'queued':
      return 'QUEUED';
    case 'initiated':
      return 'INITIATING';
    case 'ringing':
      return 'RINGING';
    case 'in-progress':
      return 'IN_PROGRESS';
    case 'completed':
      return 'COMPLETED';
    case 'failed':
      return 'FAILED';
    case 'busy':
      return 'BUSY';
    case 'no-answer':
      return 'NO_ANSWER';
    case 'canceled':
      return 'CANCELLED';
    default:
      return 'FAILED';
  }
}

/**
 * Granular capability flags exposed by any calling or voice provider adapter.
 */
export interface ProviderCapabilities {
  supportsInbound: boolean;
  supportsOutbound: boolean;
  supportsCustomVoices: boolean;
  supportsTransfer: boolean;
  supportsRecording: boolean;
  supportsTranscripts: boolean;
  supportsRealtimeTranscription: boolean;
  supportedCodecs: string[];
}

/**
 * Provider connection states for frontend status visualization.
 */
export type ProviderConnectionState =
  | 'NOT_CONFIGURED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'CONNECTION_FAILED'
  | 'DEGRADED'
  | 'DISCONNECTED';

/**
 * Live provider verification status: strictly distinguishes verified credentials from unverified mocks.
 */
export type ProviderVerificationState = 'UNVERIFIED' | 'VERIFIED' | 'TEST_MODE';

// ------------------------------------------------------------------------------
// TELEPHONY LAYER CONTRACTS (Twilio & Carriers)
// ------------------------------------------------------------------------------

export type TelephonyProviderId = 'twilio' | 'mock-telephony';

export interface PhoneNumberCapabilities {
  voice: boolean;
  sms: boolean;
  mms: boolean;
  e164: boolean;
  tollFree: boolean;
}

export interface TelephonyPhoneNumber {
  id: string;
  workspaceId: string;
  phoneNumber: string; // E.164 format (e.g. +15125550199)
  friendlyName: string;
  provider: TelephonyProviderId;
  capabilities: PhoneNumberCapabilities;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'RELEASED';
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  inboundWebhookUrl?: string | null;
  outboundCallerIdEnabled: boolean;
  purchasedWithoutAutoBuy?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InboundRoutingConfig {
  phoneNumber: string;
  targetAgentId?: string;
  forwardToNumber?: string;
  webhookUrl?: string;
  recordingEnabled: boolean;
}

export interface OutboundRoutingConfig {
  callerId: string;
  maxDurationSeconds?: number;
  statusCallbackUrl?: string;
  recordingConsent: boolean;
}

export interface NormalizedTelephonyEvent {
  eventId: string;
  provider: TelephonyProviderId;
  providerCallId: string;
  eventType: CallEventType;
  normalizedStatus: NormalizedCallStatus;
  durationSeconds?: number;
  occurredAt: string;
  rawPayload?: Record<string, unknown>;
}

export interface MaskedTwilioCredentials {
  accountSid: string; // e.g. "AC...9876"
  authTokenMasked: string; // e.g. "••••••••1234"
  apiKeyMasked?: string;
  primaryPhoneNumber?: string;
  isConfigured: boolean;
  verificationStatus: ProviderVerificationState;
}

// ------------------------------------------------------------------------------
// VOICE AI LAYER CONTRACTS (Retell AI, Vapi & Mock Engine)
// ------------------------------------------------------------------------------

export type VoiceAIProviderId = 'retell' | 'vapi' | 'mock-voice-ai';

export interface VoiceAIModel {
  id: string;
  provider: VoiceAIProviderId;
  name: string;
  description?: string;
  contextWindow?: number;
  recommendedFor?: string;
}

export interface VoiceAIVoice {
  id: string;
  provider: VoiceAIProviderId;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  sampleUrl?: string;
  supportedLanguages?: string[];
}

export interface VoiceAIAssistantConfig {
  assistantId?: string;
  provider: VoiceAIProviderId;
  name: string;
  model: string;
  voice: string;
  systemPrompt: string;
  firstMessage: string;
  temperature?: number;
  talkingPoints?: string[];
  objections?: Record<string, string>;
  qualificationQuestions?: string[];
}

export interface VoiceAIAssistantSyncResult {
  assistantId: string;
  provider: VoiceAIProviderId;
  syncedAt: string;
  version?: string;
  status: 'SYNCED' | 'FAILED' | 'PENDING';
}

export interface VoiceAIDispatchPayload {
  callId: string;
  leadId: string;
  contactId: string;
  recipientPhone: string;
  assistantId: string;
  dynamicVariables?: Record<string, string>;
  recordingEnabled?: boolean;
}

export interface VoiceAICallDispatchResult {
  providerCallId: string;
  provider: VoiceAIProviderId;
  status: NormalizedCallStatus;
  startedAt: string;
}

export interface NormalizedVoiceAIEvent {
  eventId: string;
  provider: VoiceAIProviderId;
  providerCallId: string;
  eventType: string;
  normalizedStatus: NormalizedCallStatus;
  transcriptTurns?: CallTranscriptTurn[];
  recordingUrl?: string;
  durationSeconds?: number;
  occurredAt: string;
  metadata?: Record<string, unknown>;
}

export interface CallRecordingMetadata {
  callId: string;
  recordingUrl?: string;
  recordingSid?: string;
  durationSeconds?: number;
  channels?: number;
  status: 'PROCESSING' | 'AVAILABLE' | 'FAILED' | 'NOT_RECORDED';
  authorizedPlaybackUrl?: string;
}

export interface MaskedRetellCredentials {
  apiKeyMasked: string; // e.g. "key_...4321"
  isConfigured: boolean;
  verificationStatus: ProviderVerificationState;
}

export interface MaskedVapiCredentials {
  apiKeyMasked: string; // e.g. "sk_...8765"
  orgIdMasked?: string;
  isConfigured: boolean;
  verificationStatus: ProviderVerificationState;
}

export interface ProviderIntegrationCard {
  providerId: string;
  name: string;
  category: 'TELEPHONY' | 'VOICE_AI';
  connectionState: ProviderConnectionState;
  verificationState: ProviderVerificationState;
  capabilities: ProviderCapabilities;
  maskedCredentials?: Record<string, string>;
  lastHealthCheck?: string;
  statusMessage?: string;
}

// Re-export Voice Agent Studio Types
export * from './voice-agent';
