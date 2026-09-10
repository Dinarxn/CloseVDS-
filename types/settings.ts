/**
 * closeVDS System Settings & Safety Domain Types
 * Phase 1 — Step 9+ Batch
 */

export interface SafetyLimitsConfig {
  dailyOutreachCap: number;
  dispatchDelaySeconds: number;
  businessHoursOnly: boolean;
  sendingWindowStart: string; // e.g., "09:00"
  sendingWindowEnd: string; // e.g., "17:00"
  timezone: string;
  globalKillSwitchActive: boolean;
}

export type SupportedAiProvider = "gemini" | "groq" | "openrouter";

export interface AiProviderConfig {
  activeProvider: SupportedAiProvider;
  geminiModel: string;
  groqModel: string;
  openrouterModel: string;
  strictAntiHallucination: boolean;
  maxTokensPerPrompt: number;
  temperature: number;
}

export interface SuppressionConfig {
  blockedDomains: string[];
  optOutKeywords: string[];
  physicalAddressFooter: string;
  requireOneClickUnsubscribe: boolean;
}

export interface GeneralSettingsConfig {
  workspaceName: string;
  operatorEmail: string;
  notifyOnReply: boolean;
  notifyOnMeeting: boolean;
  notifyOnSafetyAlert: boolean;
}

export interface SystemSettings {
  safety: SafetyLimitsConfig;
  ai: AiProviderConfig;
  suppression: SuppressionConfig;
  general: GeneralSettingsConfig;
}
