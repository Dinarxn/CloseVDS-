import { SystemSettings } from "@/types/settings";

export const INITIAL_SETTINGS: SystemSettings = {
  safety: {
    dailyOutreachCap: 50,
    dispatchDelaySeconds: 45,
    businessHoursOnly: true,
    sendingWindowStart: "09:00",
    sendingWindowEnd: "17:00",
    timezone: "America/New_York",
    globalKillSwitchActive: false,
  },
  ai: {
    activeProvider: "gemini",
    geminiModel: "gemini-2.5-flash",
    groqModel: "llama-3.3-70b-versatile",
    openrouterModel: "anthropic/claude-3.5-sonnet",
    strictAntiHallucination: true,
    maxTokensPerPrompt: 1000,
    temperature: 0.2,
  },
  suppression: {
    blockedDomains: ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
    optOutKeywords: ["unsubscribe", "stop", "remove", "not interested", "opt out"],
    physicalAddressFooter: "123 Business Way, Suite 400, Wilmington, DE 19801",
    requireOneClickUnsubscribe: true,
  },
  general: {
    workspaceName: "closeVDS Production Workspace",
    operatorEmail: "operator@closevds.com",
    notifyOnReply: true,
    notifyOnMeeting: true,
    notifyOnSafetyAlert: true,
  },
};
