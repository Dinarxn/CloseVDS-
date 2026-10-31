/**
 * Domain TypeScript types for closeVDS 11-Step Voice Agent Studio & Lifecycle State Machine.
 * Strictly decoupled from specific providers, supporting Retell AI, Vapi, and local Mock engine.
 */

export type VoiceAgentProviderType = 'retell' | 'vapi' | 'mock';

export type VoiceAgentLifecycleStatus =
  | 'DRAFT'
  | 'INCOMPLETE'
  | 'READY_FOR_TEST'
  | 'TESTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'ERROR';

export interface VoiceModelOption {
  id: string;
  provider: VoiceAgentProviderType;
  name: string;
  description: string;
  contextWindow: number;
  recommendedFor: string;
  isDefault?: boolean;
}

export interface VoiceOption {
  id: string;
  provider: VoiceAgentProviderType;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  previewAudioUrl?: string;
  sampleRateHz?: number;
  tags?: string[];
}

export interface ObjectionHandlingRule {
  id: string;
  category: string;
  triggerPhrases: string[];
  responseGuidance: string;
  priority: number;
}

export interface QualificationQuestion {
  id: string;
  questionText: string;
  required: boolean;
  expectedAnswerType: 'BOOLEAN' | 'TEXT' | 'NUMBER' | 'CHOICE';
  choices?: string[];
  criteriaRule?: string;
}

export interface VoiceAgentKnowledgePoint {
  id: string;
  category: string;
  title: string;
  content: string;
  isMandatory: boolean;
}

export interface VoiceAgentSafetyGuardrails {
  maxDurationSeconds: number;
  callingWindowStart: string;
  callingWindowEnd: string;
  allowedDays: number[];
  optOutKeywords: string[];
  enforceDnc: boolean;
  humanApprovalRequired: boolean;
  emergencyKillSwitch: boolean;
  dailyCallCap: number;
}

export interface ReadinessCheckItem {
  id: string;
  stepNumber: number;
  stepName: string;
  passed: boolean;
  required: boolean;
  details?: string;
}

export interface VoiceAgentReadinessReport {
  agentId: string;
  currentStatus: VoiceAgentLifecycleStatus;
  canActivate: boolean;
  checks: ReadinessCheckItem[];
  blockers: string[];
  evaluatedAt: string;
}

/**
 * 11-Step Guided Voice Agent Configuration Studio Model
 */
export interface VoiceAgentStudioConfig {
  id: string;
  workspaceId: string;
  name: string;
  status: VoiceAgentLifecycleStatus;
  
  // Step 1: Provider Selection
  provider: VoiceAgentProviderType;
  providerConfigured: boolean;
  
  // Step 2: Model Configuration
  modelId: string;
  temperature: number;
  maxTokens: number;
  
  // Step 3: Voice Selection
  voiceId: string;
  voiceProvider: string;
  voiceSpeed?: number;
  voicePitch?: number;
  voiceStability?: number;
  
  // Step 4: System Prompt & Persona
  callObjective: string;
  openingScript: string;
  agentPersona: string;
  speakingStyle: string;
  
  // Step 5: Knowledge Base & Talking Points
  approvedTalkingPoints: string[];
  knowledgePoints?: VoiceAgentKnowledgePoint[];
  prohibitedClaims: string[];
  
  // Step 6: Objection Handling
  objectionRules: ObjectionHandlingRule[];
  objectionHandling?: Record<string, string>; // Backward-compatibility
  
  // Step 7: Qualification Questions
  qualificationQuestions: string[];
  structuredQuestions?: QualificationQuestion[];
  
  // Step 8: Phone Number Assignment & Compatibility
  assignedPhoneNumberId?: string | null;
  assignedPhoneNumber?: string | null;
  numberProviderCompatible?: boolean;
  
  // Step 9: Safety & Guardrails
  safety: VoiceAgentSafetyGuardrails;
  escalationConditions: string[];
  fallbackBehavior?: string;
  
  // Step 10: Test Configuration
  testPhoneNumber?: string | null;
  lastTestedAt?: string | null;
  testNotes?: string | null;
  
  // Step 11: Review & Readiness
  readinessReport?: VoiceAgentReadinessReport | null;
  activatedAt?: string | null;
  maxDurationSeconds?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoiceAgentStudioInput {
  name: string;
  provider: VoiceAgentProviderType;
  modelId?: string;
  voiceId?: string;
  callObjective: string;
  openingScript: string;
  agentPersona?: string;
  speakingStyle?: string;
  approvedTalkingPoints: string[];
  prohibitedClaims: string[];
  qualificationQuestions: string[];
  structuredQuestions?: QualificationQuestion[];
  objectionRules?: ObjectionHandlingRule[];
  objectionHandling?: Record<string, string>;
  escalationConditions?: string[];
  fallbackBehavior?: string;
  assignedPhoneNumberId?: string | null;
  safety?: Partial<VoiceAgentSafetyGuardrails>;
  maxDurationSeconds?: number;
}

export interface UpdateVoiceAgentStudioInput extends Partial<CreateVoiceAgentStudioInput> {
  status?: VoiceAgentLifecycleStatus;
  testPhoneNumber?: string | null;
}
