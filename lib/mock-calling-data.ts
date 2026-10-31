/**
 * Local test fixtures and mock adapters for CloseVDS Calling Subsystem offline development integrity mode.
 * Real, un-fabricated data structures adhering to TypeScript contracts without faking live provider connections.
 */

import type {
  ProviderCapabilities,
  ProviderIntegrationCard,
  TelephonyPhoneNumber,
  VoiceAIModel,
  VoiceAIVoice,
  VoiceAgentStudioConfig,
  CallWithRelations,
  CallRecordingMetadata,
} from '@/types/calling';

/**
 * Standard provider capability profiles
 */
export const MOCK_TWILIO_CAPABILITIES: ProviderCapabilities = {
  supportsInbound: true,
  supportsOutbound: true,
  supportsCustomVoices: false,
  supportsTransfer: true,
  supportsRecording: true,
  supportsTranscripts: false,
  supportsRealtimeTranscription: false,
  supportedCodecs: ['PCMU', 'PCMA', 'opus', 'g711'],
};

export const MOCK_RETELL_CAPABILITIES: ProviderCapabilities = {
  supportsInbound: true,
  supportsOutbound: true,
  supportsCustomVoices: true,
  supportsTransfer: true,
  supportsRecording: true,
  supportsTranscripts: true,
  supportsRealtimeTranscription: true,
  supportedCodecs: ['opus', 'pcm16', 'mulaw'],
};

export const MOCK_VAPI_CAPABILITIES: ProviderCapabilities = {
  supportsInbound: true,
  supportsOutbound: true,
  supportsCustomVoices: true,
  supportsTransfer: true,
  supportsRecording: true,
  supportsTranscripts: true,
  supportsRealtimeTranscription: true,
  supportedCodecs: ['opus', 'pcm16', 'mulaw'],
};

/**
 * Provider integration status cards for development integrity mode.
 * Explicitly marked as UNVERIFIED unless active credentials exist in the local environment.
 */
export const MOCK_PROVIDER_CARDS: ProviderIntegrationCard[] = [
  {
    providerId: 'twilio',
    name: 'Twilio Carrier Telephony',
    category: 'TELEPHONY',
    connectionState: 'NOT_CONFIGURED',
    verificationState: 'UNVERIFIED',
    capabilities: MOCK_TWILIO_CAPABILITIES,
    maskedCredentials: {
      accountSid: 'AC•••••••••••••••••••••••••••••9876',
      authTokenMasked: '••••••••••••••••4321',
      primaryPhoneNumber: '+1 (512) 555-0199',
    },
    lastHealthCheck: '2026-10-30T18:00:00Z',
    statusMessage: 'Twilio credentials not configured in local environment (.env). Operating in offline mock mode.',
  },
  {
    providerId: 'retell',
    name: 'Retell AI Conversational Voice',
    category: 'VOICE_AI',
    connectionState: 'NOT_CONFIGURED',
    verificationState: 'UNVERIFIED',
    capabilities: MOCK_RETELL_CAPABILITIES,
    maskedCredentials: {
      apiKeyMasked: 'key_••••••••••••••••••••••••••1234',
    },
    lastHealthCheck: '2026-10-30T18:00:00Z',
    statusMessage: 'Retell AI API key not configured in local environment (.env). Operating in offline mock mode.',
  },
  {
    providerId: 'vapi',
    name: 'Vapi Voice Intelligence Platform',
    category: 'VOICE_AI',
    connectionState: 'NOT_CONFIGURED',
    verificationState: 'UNVERIFIED',
    capabilities: MOCK_VAPI_CAPABILITIES,
    maskedCredentials: {
      apiKeyMasked: 'sk_vapi_••••••••••••••••••••••5678',
      orgIdMasked: 'org_••••••••••••••••••••••••••9012',
    },
    lastHealthCheck: '2026-10-30T18:00:00Z',
    statusMessage: 'Vapi API key not configured in local environment (.env). Operating in offline mock mode.',
  },
];

/**
 * Available phone numbers in the development workspace.
 */
export const MOCK_PHONE_NUMBERS: TelephonyPhoneNumber[] = [
  {
    id: 'phone_num_austin_1',
    workspaceId: 'ws_default_1',
    phoneNumber: '+15125550199',
    friendlyName: 'Austin Direct Dispatch Line 1',
    provider: 'twilio',
    capabilities: {
      voice: true,
      sms: true,
      mms: false,
      e164: true,
      tollFree: false,
    },
    status: 'ACTIVE',
    assignedAgentId: 'agent_dr_sarah_1',
    assignedAgentName: 'Dr. Sarah (Dental SDR)',
    inboundWebhookUrl: 'https://api.closevds.com/api/v1/voice/webhooks/twilio/inbound',
    outboundCallerIdEnabled: true,
    purchasedWithoutAutoBuy: true,
    createdAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
  },
  {
    id: 'phone_num_tollfree_2',
    workspaceId: 'ws_default_1',
    phoneNumber: '+18005550144',
    friendlyName: 'National Inbound Toll-Free',
    provider: 'twilio',
    capabilities: {
      voice: true,
      sms: true,
      mms: true,
      e164: true,
      tollFree: true,
    },
    status: 'ACTIVE',
    assignedAgentId: null,
    assignedAgentName: null,
    inboundWebhookUrl: 'https://api.closevds.com/api/v1/voice/webhooks/twilio/inbound',
    outboundCallerIdEnabled: false,
    purchasedWithoutAutoBuy: true,
    createdAt: '2026-10-05T10:00:00Z',
    updatedAt: '2026-10-20T09:15:00Z',
  },
];

/**
 * Discovered AI Models for Retell & Vapi
 */
export const MOCK_VOICE_AI_MODELS: VoiceAIModel[] = [
  {
    id: 'gpt-4o',
    provider: 'retell',
    name: 'OpenAI GPT-4o (Realtime Optimized)',
    description: 'Sub-400ms latency, high conversational fidelity, strong objection handling',
    contextWindow: 128000,
    recommendedFor: 'Complex B2B cold calling & objection handling',
  },
  {
    id: 'claude-3-5-sonnet',
    provider: 'retell',
    name: 'Anthropic Claude 3.5 Sonnet',
    description: 'Highest nuance, strict guardrail adherence, minimal hallucination rate',
    contextWindow: 200000,
    recommendedFor: 'High-ticket enterprise discovery & strict compliance',
  },
  {
    id: 'vapi-neural-1',
    provider: 'vapi',
    name: 'Vapi Neural Voice Engine 1.0',
    description: 'Ultra-low latency streaming architecture with built-in voice activity detection',
    contextWindow: 64000,
    recommendedFor: 'High-volume outbound screening',
  },
];

/**
 * Discovered AI Voices
 */
export const MOCK_VOICE_AI_VOICES: VoiceAIVoice[] = [
  {
    id: 'voice_rachel_11labs',
    provider: 'retell',
    name: 'Rachel (ElevenLabs Natural)',
    gender: 'female',
    accent: 'American (Professional)',
    sampleUrl: '/audio/samples/rachel-preview.mp3',
    supportedLanguages: ['en-US', 'en-GB'],
  },
  {
    id: 'voice_marcus_azure',
    provider: 'retell',
    name: 'Marcus (Azure Neural HQ)',
    gender: 'male',
    accent: 'American (Midwestern Warm)',
    sampleUrl: '/audio/samples/marcus-preview.mp3',
    supportedLanguages: ['en-US'],
  },
  {
    id: 'voice_sophia_cartesia',
    provider: 'vapi',
    name: 'Sophia (Cartesia Sonic)',
    gender: 'female',
    accent: 'American (Enthusiastic)',
    sampleUrl: '/audio/samples/sophia-preview.mp3',
    supportedLanguages: ['en-US', 'es-ES'],
  },
];

/**
 * Seed 11-step studio voice agent
 */
export const MOCK_STUDIO_AGENT: VoiceAgentStudioConfig = {
  id: 'agent_dr_sarah_1',
  workspaceId: 'ws_default_1',
  name: 'Dental Practice Diagnostic SDR (Sarah)',
  status: 'READY_FOR_TEST',
  provider: 'retell',
  providerConfigured: false,
  modelId: 'gpt-4o',
  temperature: 0.3,
  maxTokens: 250,
  voiceId: 'voice_rachel_11labs',
  voiceProvider: 'ElevenLabs',
  voiceSpeed: 1.0,
  voiceStability: 0.75,
  callObjective: 'Identify website booking drop-off and schedule a 10-minute diagnostic session with practice manager',
  openingScript: "Hi Dr. Connor, this is Sarah with closeVDS. I'm reaching out because our technical audit identified a 4.2-second mobile load time on your appointment booking page that may be costing you new patient bookings. Do you have two minutes to discuss?",
  agentPersona: 'Professional, articulate healthcare growth specialist who speaks with empathy and technical authority.',
  speakingStyle: 'Concise, calm, never pushy, always grounded in observed technical facts.',
  approvedTalkingPoints: [
    'Observed 4.2-second mobile load time on appointment page',
    'Mobile booking friction causing estimated 30-40% visitor drop-off',
    'Quick technical fix available within 48 hours without replacing current CMS',
  ],
  prohibitedClaims: [
    'Never guarantee specific patient volume or 10x ROI',
    'Do not claim to be affiliated with Google, Dentrix, or ADA',
    'Never quote pricing on the phone without diagnostic review',
  ],
  objectionRules: [
    {
      id: 'obj_not_interested',
      category: 'Not Interested',
      triggerPhrases: ['not interested', 'take me off your list', 'dont call again'],
      responseGuidance: 'Acknowledge immediately, apologize politely, confirm removal, and end the call cleanly.',
      priority: 100,
    },
    {
      id: 'obj_busy_now',
      category: 'Busy / Bad Time',
      triggerPhrases: ['in the middle of a procedure', 'with a patient', 'call me back later', 'too busy right now'],
      responseGuidance: 'Respect their time completely. Ask for their preferred day and morning vs. afternoon for a brief callback.',
      priority: 80,
    },
    {
      id: 'obj_already_have_agency',
      category: 'Existing Vendor',
      triggerPhrases: ['already have a marketing agency', 'our web guy handles that', 'we have someone for this'],
      responseGuidance: 'Affirm that their agency is likely great. Clarify that this is a specific technical bottleneck in the booking widget they might want to pass to their team.',
      priority: 70,
    },
  ],
  qualificationQuestions: [
    'Does the practice currently accept new patients online?',
    'Who oversees patient acquisition and website performance decisions?',
    'Would you be open to reviewing the 1-page mobile audit report?',
  ],
  assignedPhoneNumberId: 'phone_num_austin_1',
  assignedPhoneNumber: '+15125550199',
  numberProviderCompatible: true,
  safety: {
    maxDurationSeconds: 300,
    callingWindowStart: '09:00',
    callingWindowEnd: '17:00',
    allowedDays: [1, 2, 3, 4, 5],
    optOutKeywords: ['stop', 'unsubscribe', 'do not call', 'remove me', 'never call again'],
    enforceDnc: true,
    humanApprovalRequired: true,
    emergencyKillSwitch: false,
    dailyCallCap: 25,
  },
  escalationConditions: [
    'Lead asks for complex pricing or legal guarantees',
    'Lead requests immediate human supervisor',
    'Hostile or abusive language detected',
  ],
  testPhoneNumber: '+15125550199',
  lastTestedAt: null,
  readinessReport: {
    agentId: 'agent_dr_sarah_1',
    currentStatus: 'READY_FOR_TEST',
    canActivate: false, // Requires live test passing & provider credentials
    checks: [
      { id: 'c1', stepNumber: 1, stepName: 'Provider Configured', passed: false, required: true, details: 'Retell AI API key unverified in local environment' },
      { id: 'c2', stepNumber: 2, stepName: 'AI Model Selected', passed: true, required: true, details: 'OpenAI GPT-4o configured' },
      { id: 'c3', stepNumber: 3, stepName: 'Voice Selected', passed: true, required: true, details: 'Rachel (ElevenLabs Natural)' },
      { id: 'c4', stepNumber: 4, stepName: 'Script & Objective', passed: true, required: true, details: 'Complete script and persona defined' },
      { id: 'c5', stepNumber: 5, stepName: 'Knowledge & Boundaries', passed: true, required: true, details: '3 talking points, 3 prohibited claims' },
      { id: 'c6', stepNumber: 6, stepName: 'Objection Handling', passed: true, required: true, details: '3 active objection rules' },
      { id: 'c7', stepNumber: 7, stepName: 'Qualification Questions', passed: true, required: true, details: '3 qualification questions' },
      { id: 'c8', stepNumber: 8, stepName: 'Phone Number Assigned', passed: true, required: true, details: '+1 (512) 555-0199 assigned' },
      { id: 'c9', stepNumber: 9, stepName: 'Safety Invariants Active', passed: true, required: true, details: 'DNC, calling window, human approval active' },
      { id: 'c10', stepNumber: 10, stepName: 'Test Call Passed', passed: false, required: true, details: 'End-to-end test call not yet verified' },
    ],
    blockers: [
      'Provider credentials for Retell AI must be configured',
      'At least one successful test call must be recorded before activation',
    ],
    evaluatedAt: '2026-10-30T18:00:00Z',
  },
  createdAt: '2026-10-28T09:00:00Z',
  updatedAt: '2026-10-30T16:00:00Z',
};

/**
 * Mock detailed call with relations, synchronized turns, and recording metadata
 */
export const MOCK_CALL_DETAIL: CallWithRelations = {
  id: 'call_mock_fixture_1',
  workspaceId: 'ws_default_1',
  campaignId: 'camp_austin_dental',
  voiceCampaignId: 'vcamp_austin_1',
  leadId: 'lead_smile_123',
  contactId: 'contact_sarah_1',
  agentConfigId: 'agent_dr_sarah_1',
  recipientPhone: '+15125550188',
  normalizedPhone: '+15125550188',
  status: 'COMPLETED',
  humanApprovalRequired: true,
  isApproved: true,
  approvedByUserId: 'usr_admin_1',
  approvedAt: '2026-10-30T14:00:00Z',
  idempotencyKey: 'idem_call_mock_1',
  scheduledAt: '2026-10-30T14:05:00Z',
  initiatedAt: '2026-10-30T14:05:05Z',
  completedAt: '2026-10-30T14:06:50Z',
  durationSeconds: 105,
  providerName: 'retell',
  providerCallId: 'retell_call_mock_9921',
  blockedReason: null,
  createdAt: '2026-10-30T13:55:00Z',
  updatedAt: '2026-10-30T14:07:00Z',
  campaign: {
    id: 'camp_austin_dental',
    name: 'Austin Dental Practice Outreach',
    niche: 'Dental Clinic',
    targetOffer: 'Comprehensive Patient Retention System',
    status: 'ACTIVE',
  },
  lead: {
    id: 'lead_smile_123',
    businessName: 'Austin Smile Design',
    domain: 'austinsmiledesign.com',
    phone: '+15125550188',
    address: '400 Congress Ave, Austin, TX',
    status: 'QUALIFIED',
  },
  contact: {
    id: 'contact_sarah_1',
    fullName: 'Dr. Sarah Connor',
    email: 'sarah@austinsmiledesign.com',
    phone: '+15125550188',
    title: 'Lead Prosthodontist & Practice Owner',
  },
  transcripts: [
    {
      id: 'turn_1',
      callId: 'call_mock_fixture_1',
      turnIndex: 0,
      speaker: 'agent',
      text: "Hi Dr. Connor, this is Sarah with closeVDS. I'm reaching out because our technical audit identified a 4.2-second mobile load time on your appointment booking page. Do you have two minutes?",
      confidence: 0.98,
      timestampMs: 1200,
      createdAt: '2026-10-30T14:05:07Z',
    },
    {
      id: 'turn_2',
      callId: 'call_mock_fixture_1',
      turnIndex: 1,
      speaker: 'lead',
      text: "Yes, I have a quick minute. We noticed patients were complaining about that recently. What did your audit find?",
      confidence: 0.95,
      timestampMs: 8400,
      createdAt: '2026-10-30T14:05:15Z',
    },
    {
      id: 'turn_3',
      callId: 'call_mock_fixture_1',
      turnIndex: 2,
      speaker: 'agent',
      text: "The main bottleneck is an uncompressed image carousel and a missing SSL redirect on the booking widget. We put together a 1-page breakdown showing how to resolve it in under 48 hours. Would tomorrow at 2 PM work to review?",
      confidence: 0.97,
      timestampMs: 16500,
      createdAt: '2026-10-30T14:05:25Z',
    },
    {
      id: 'turn_4',
      callId: 'call_mock_fixture_1',
      turnIndex: 3,
      speaker: 'lead',
      text: "Tomorrow at 2 PM works. Please send the invite to sarah@austinsmiledesign.com. Thank you!",
      confidence: 0.99,
      timestampMs: 28000,
      createdAt: '2026-10-30T14:05:38Z',
    },
    {
      id: 'turn_5',
      callId: 'call_mock_fixture_1',
      turnIndex: 4,
      speaker: 'agent',
      text: "Perfect! I've sent the calendar invite and the audit report to your email. Have a wonderful rest of your day, Dr. Connor.",
      confidence: 0.98,
      timestampMs: 34500,
      createdAt: '2026-10-30T14:05:45Z',
    },
  ],
  outcome: {
    id: 'out_mock_1',
    callId: 'call_mock_fixture_1',
    outcome: 'MEETING_REQUESTED',
    interestLevel: 'HIGH',
    objections: [],
    requestedFollowUp: 'Tomorrow at 2 PM via Google Meet',
    nextAction: 'Send calendar invite with attached audit report',
    sentiment: 'POSITIVE',
    optOutDetected: false,
    summary: 'Dr. Connor validated the mobile load time issue and agreed to a 10-minute diagnostic review tomorrow at 2 PM. Calendar invite dispatched to sarah@austinsmiledesign.com.',
    derivedFromActual: true,
    analyzedAt: '2026-10-30T14:06:55Z',
  },
};

export const MOCK_RECORDING_METADATA: CallRecordingMetadata = {
  callId: 'call_mock_fixture_1',
  recordingUrl: 'https://storage.closevds.com/recordings/call_mock_fixture_1.mp3',
  recordingSid: 'RE_mock_recording_sid_123',
  durationSeconds: 105,
  channels: 2,
  status: 'AVAILABLE',
  authorizedPlaybackUrl: 'https://storage.closevds.com/recordings/call_mock_fixture_1.mp3?token=auth_sample_123',
};
