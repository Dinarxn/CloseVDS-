"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  VoiceAgentStudioConfig,
  VoiceAgentProviderType,
  VoiceAgentLifecycleStatus,
  VoiceAgentSafetyGuardrails,
  ObjectionHandlingRule,
  VoiceAgentReadinessReport,
} from "@/types/voice-agent";
import { StepIndicator, STUDIO_STEPS } from "./step-indicator";
import { StepProviderSelect } from "./step-provider-select";
import { StepModelSelect } from "./step-model-select";
import { StepVoiceSelect } from "./step-voice-select";
import { StepPersonaPrompt } from "./step-persona-prompt";
import { StepKnowledgeBase } from "./step-knowledge-base";
import { StepObjectionHandling } from "./step-objection-handling";
import { StepQualificationQuestions } from "./step-qualification-questions";
import { StepPhoneNumber } from "./step-phone-number";
import { StepSafetyGuardrails } from "./step-safety-guardrails";
import { StepTestConfiguration } from "./step-test-configuration";
import { StepReadinessReview } from "./step-readiness-review";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface VoiceAgentStudioWizardProps {
  initialAgent?: VoiceAgentStudioConfig | null;
  agentId?: string;
  onSaved?: (agent: VoiceAgentStudioConfig) => void;
}

const DEFAULT_SAFETY: VoiceAgentSafetyGuardrails = {
  maxDurationSeconds: 300,
  callingWindowStart: "09:00",
  callingWindowEnd: "18:00",
  allowedDays: [1, 2, 3, 4, 5],
  optOutKeywords: ["stop calling", "remove me", "unsubscribe", "do not call", "take me off your list"],
  enforceDnc: true,
  humanApprovalRequired: false,
  emergencyKillSwitch: false,
  dailyCallCap: 50,
};

export function VoiceAgentStudioWizard({
  initialAgent,
  agentId: initialAgentId,
  onSaved,
}: VoiceAgentStudioWizardProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1]));
  const [stepErrors, setStepErrors] = useState<Record<number, boolean>>({});

  // Core Form State
  const [agentId, setAgentId] = useState<string | undefined>(
    initialAgent?.id || initialAgentId
  );
  const [status, setStatus] = useState<VoiceAgentLifecycleStatus>(
    initialAgent?.status || "DRAFT"
  );
  const [provider, setProvider] = useState<VoiceAgentProviderType>(
    initialAgent?.provider || "retell"
  );
  const [modelId, setModelId] = useState<string>(
    initialAgent?.modelId || "gpt-4o-realtime"
  );
  const [temperature, setTemperature] = useState<number>(
    initialAgent?.temperature ?? 0.7
  );
  const [maxTokens, setMaxTokens] = useState<number>(
    initialAgent?.maxTokens ?? 400
  );
  const [voiceId, setVoiceId] = useState<string>(
    initialAgent?.voiceId || "retell-eleven-sarah"
  );
  const [voiceSpeed, setVoiceSpeed] = useState<number>(
    initialAgent?.voiceSpeed ?? 1.0
  );
  const [voiceStability, setVoiceStability] = useState<number>(
    initialAgent?.voiceStability ?? 0.75
  );

  // Step 4: Persona & Prompt
  const [name, setName] = useState<string>(
    initialAgent?.name || "Alex - Senior Acquisition Advisor"
  );
  const [speakingStyle, setSpeakingStyle] = useState<string>(
    initialAgent?.speakingStyle || "Empathetic, clear, consultative, and professional"
  );
  const [agentPersona, setAgentPersona] = useState<string>(
    initialAgent?.agentPersona || "Senior Acquisition Consultant representing CloseVDS with 7+ years advising clinics"
  );
  const [openingScript, setOpeningScript] = useState<string>(
    initialAgent?.openingScript || "Hi, this is Alex with CloseVDS. I am reaching out regarding your patient intake workflow. Do you have two minutes to speak?"
  );
  const [callObjective, setCallObjective] = useState<string>(
    initialAgent?.callObjective || "Introduce CloseVDS client acquisition capabilities, qualify prospective business fit, identify current booking gaps, and secure a 15-minute technical audit walkthrough demo with the decision maker."
  );

  // Step 5: Knowledge Base
  const [approvedTalkingPoints, setApprovedTalkingPoints] = useState<string[]>(
    initialAgent?.approvedTalkingPoints?.length
      ? initialAgent.approvedTalkingPoints
      : [
          "Observed technical audit gaps on company website",
          "Automated booking integration without staff overhead",
          "24/7 instant patient inquiry response and calendar sync",
        ]
  );
  const [prohibitedClaims, setProhibitedClaims] = useState<string[]>(
    initialAgent?.prohibitedClaims?.length
      ? initialAgent.prohibitedClaims
      : [
          "Never guarantee 100% revenue increases",
          "Never quote unapproved custom pricing",
          "Never promise legal or clinical medical advice",
        ]
  );

  // Step 6: Objections
  const [objectionRules, setObjectionRules] = useState<ObjectionHandlingRule[]>(
    initialAgent?.objectionRules?.length
      ? initialAgent.objectionRules
      : [
          {
            id: "obj-price",
            category: "Price & Budget",
            triggerPhrases: ["too expensive", "no budget", "cost is high"],
            responseGuidance: "Acknowledge cost sensitivity directly. Clarify that CloseVDS requires zero upfront software overhaul and our demonstration measures leaked patient bookings without commitment.",
            priority: 8,
          },
        ]
  );

  // Step 7: Qualification
  const [qualificationQuestions, setQualificationQuestions] = useState<string[]>(
    initialAgent?.qualificationQuestions?.length
      ? initialAgent.qualificationQuestions
      : [
          "Are you currently taking on new clients or patients?",
          "Who primarily handles your scheduling and booking workflows?",
        ]
  );

  // Step 8: Phone Number
  const [assignedPhoneNumberId, setAssignedPhoneNumberId] = useState<string | null>(
    initialAgent?.assignedPhoneNumberId || null
  );
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState<string | null>(
    initialAgent?.assignedPhoneNumber || null
  );

  // Step 9: Safety
  const [safety, setSafety] = useState<VoiceAgentSafetyGuardrails>(
    initialAgent?.safety || DEFAULT_SAFETY
  );
  const [escalationConditions, setEscalationConditions] = useState<string[]>(
    initialAgent?.escalationConditions?.length
      ? initialAgent.escalationConditions
      : [
          "Prospect explicitly requests human manager",
          "Prospect mentions legal or regulatory compliance inquiry",
        ]
  );
  const [fallbackBehavior, setFallbackBehavior] = useState<string>(
    initialAgent?.fallbackBehavior || "Apologize politely for audio noise, confirm you will send the scheduled demo link by SMS, and terminate call cleanly."
  );

  // Step 10: Test
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>(
    initialAgent?.testPhoneNumber || "+15125550199"
  );
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(
    initialAgent?.lastTestedAt || null
  );

  // Step 11: Readiness
  const [readinessReport, setReadinessReport] = useState<VoiceAgentReadinessReport | null>(
    initialAgent?.readinessReport || null
  );

  // Status & UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Preset Handlers
  const handleApplyPreset = (preset: "english" | "hindi") => {
    if (preset === "english") {
      setName("Alex - Senior Growth Specialist (English Voice Agent)");
      setSpeakingStyle("Direct, consultative, empathetic, and professional");
      setAgentPersona("Senior acquisition consultant representing CloseVDS with 7+ years advising businesses");
      setOpeningScript("Hi, this is Alex with CloseVDS. I am reaching out specifically regarding your online client intake workflow. Do you have two minutes?");
      setCallObjective("Introduce CloseVDS client acquisition capabilities, qualify prospective business fit, identify current booking gaps, and secure a 15-minute technical audit walkthrough demo with the decision maker.");
      setApprovedTalkingPoints([
        "Observed technical audit gaps on company website",
        "Automated booking integration without staff overhead",
        "24/7 instant patient inquiry response and calendar sync",
      ]);
      setProhibitedClaims([
        "Never guarantee 100% revenue increases",
        "Never quote unapproved custom pricing",
      ]);
    } else {
      setName("राजेश - वरिष्ठ विकास सलाहकार (Hindi Voice Agent)");
      setSpeakingStyle("विनम्र, स्पष्ट और पेशेवर हिंदी भाषा में संवाद");
      setAgentPersona("क्लिनिक और हेल्थकेयर के लिए वरिष्ठ डिजिटल विकास सलाहकार");
      setOpeningScript("नमस्ते, मैं CloseVDS से बोल रहा हूँ। मैं आपके क्लिनिक के पेशेंट बुकिंग वर्कफ़्लो के बारे में संपर्क कर रहा हूँ। क्या मेरी बात प्रैक्टिस मैनेजर से हो रही है?");
      setCallObjective("क्लिनिक के निर्णयकर्ता से बात करके 15 मिनट के ग्रोथ ऑडिट डेमो का समय निर्धारित करना और अपॉइंटमेंट ऑटोमेशन की जानकारी देना।");
      setApprovedTalkingPoints([
        "वेबसाइट और गूगल मैप्स प्रोफाइल पर पेशेंट बुकिंग की कमियों का विश्लेषण",
        "बिना अतिरिक्त स्टाफ के 24/7 ऑटोमेटेड अपॉइंटमेंट शेड्यूलिंग",
      ]);
      setProhibitedClaims([
        "कभी भी 100% राजस्व वृद्धि की गारंटी न दें",
        "बिना पूर्व-स्वीकृति के कोई अनधिकृत छूट या कस्टम मूल्य न बताएं",
      ]);
      setVoiceId("retell-rajesh-hindi");
    }
    addToast({
      title: "Preset Applied",
      description: `Loaded ${preset === "english" ? "English (Alex)" : "Hindi (Rajesh)"} conversational configuration.`,
      variant: "success",
    });
  };

  // Build Payload
  const buildPayload = useCallback(() => {
    return {
      name,
      provider,
      modelId,
      voiceId,
      callObjective,
      openingScript,
      agentPersona,
      speakingStyle,
      approvedTalkingPoints,
      prohibitedClaims,
      qualificationQuestions,
      objectionRules,
      assignedPhoneNumberId: assignedPhoneNumberId || undefined,
      safety,
      escalationConditions,
      fallbackBehavior,
      testPhoneNumber: testPhoneNumber || undefined,
      maxDurationSeconds: safety.maxDurationSeconds,
      status,
    };
  }, [
    name,
    provider,
    modelId,
    voiceId,
    callObjective,
    openingScript,
    agentPersona,
    speakingStyle,
    approvedTalkingPoints,
    prohibitedClaims,
    qualificationQuestions,
    objectionRules,
    assignedPhoneNumberId,
    safety,
    escalationConditions,
    fallbackBehavior,
    testPhoneNumber,
    status,
  ]);

  // Save Agent (Create or Update)
  const saveAgent = useCallback(
    async (silent = false): Promise<VoiceAgentStudioConfig | null> => {
      setIsSaving(true);
      setSaveSuccessMsg(null);
      const payload = buildPayload();

      try {
        let saved: VoiceAgentStudioConfig;
        if (agentId) {
          const res = await api.voice.updateStudioAgent(agentId, payload);
          saved = res.data;
        } else {
          const res = await api.voice.createStudioAgent(payload);
          saved = res.data;
          setAgentId(saved.id);
        }

        setStatus(saved.status);
        if (onSaved) onSaved(saved);

        if (!silent) {
          setSaveSuccessMsg("Configuration saved successfully.");
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }

        return saved;
      } catch (err: unknown) {
        const msg = err instanceof ApiClientError ? err.message : "Failed to save configuration";
        addToast({
          title: "Save Failed",
          description: msg,
          variant: "error",
        });
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [agentId, buildPayload, onSaved, addToast]
  );

  // Fetch Readiness Report
  const fetchReadiness = useCallback(async () => {
    if (!agentId) {
      // Save first to get an ID
      const saved = await saveAgent(true);
      if (!saved?.id) return;
    }

    const targetId = agentId;
    if (!targetId) return;

    try {
      const res = await api.voice.getStudioAgentReadiness(targetId);
      if (res?.data) {
        setReadinessReport(res.data);
      }
    } catch {
      // Ignored non-fatal
    }
  }, [agentId, saveAgent]);

  // When step changes to Step 10 or 11, auto-save and evaluate readiness
  useEffect(() => {
    if (currentStep === 10 || currentStep === 11) {
      fetchReadiness();
    }
  }, [currentStep, fetchReadiness]);

  // Navigation handlers
  const handleNextStep = async () => {
    // Validate current step
    let hasError = false;
    if (currentStep === 4 && callObjective.trim().length <= 50) {
      hasError = true;
      setStepErrors((prev) => ({ ...prev, 4: true }));
      addToast({
        title: "Validation Error",
        description: "System prompt / objective must exceed 50 characters to advance.",
        variant: "error",
      });
      return;
    }

    if (currentStep === 7 && qualificationQuestions.length === 0) {
      hasError = true;
      setStepErrors((prev) => ({ ...prev, 7: true }));
      addToast({
        title: "Validation Error",
        description: "At least one qualification question is required.",
        variant: "error",
      });
      return;
    }

    if (!hasError) {
      setStepErrors((prev) => ({ ...prev, [currentStep]: false }));
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
    }

    // Auto-save on forward step progression
    await saveAgent(true);

    if (currentStep < 11) {
      setCurrentStep((curr) => curr + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((curr) => curr - 1);
    }
  };

  const handleStepClick = async (stepNumber: number) => {
    // Auto-save before changing steps
    await saveAgent(true);
    setCurrentStep(stepNumber);
  };

  // Test Call Completed Callback
  const handleTestCompleted = (newStatus: VoiceAgentLifecycleStatus, testedAt: string) => {
    setStatus(newStatus);
    setLastTestedAt(testedAt);
    setCompletedSteps((prev) => new Set([...prev, 10]));
    fetchReadiness();
    addToast({
      title: "Test Call Verified",
      description: "Diagnostic telephony verification completed. Status advanced to TESTED.",
      variant: "success",
    });
  };

  // Activation Callback
  const handleActivationSuccess = (updatedAgent: VoiceAgentStudioConfig) => {
    setStatus(updatedAgent.status);
    fetchReadiness();
    addToast({
      title: "Voice Agent Activated!",
      description: `Agent ${updatedAgent.name} is now ACTIVE and ready for live outreach.`,
      variant: "success",
    });
  };

  const handlePauseSuccess = (updatedAgent: VoiceAgentStudioConfig) => {
    setStatus(updatedAgent.status);
    fetchReadiness();
    addToast({
      title: "Voice Agent Paused",
      description: `Agent ${updatedAgent.name} has been paused.`,
      variant: "default",
    });
  };

  // Current agent object for Step 11
  const currentAgentConfig: VoiceAgentStudioConfig = {
    id: agentId || "draft_new",
    workspaceId: "workspace_default",
    name,
    status,
    provider,
    providerConfigured: true,
    modelId,
    temperature,
    maxTokens,
    voiceId,
    voiceProvider: provider,
    voiceSpeed,
    voiceStability,
    callObjective,
    openingScript,
    agentPersona,
    speakingStyle,
    approvedTalkingPoints,
    prohibitedClaims,
    objectionRules,
    qualificationQuestions,
    assignedPhoneNumberId,
    assignedPhoneNumber,
    safety,
    escalationConditions,
    fallbackBehavior,
    testPhoneNumber,
    lastTestedAt,
    readinessReport,
    createdAt: initialAgent?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* 11-Step Visual Stepper Bar */}
      <StepIndicator
        currentStep={currentStep}
        onStepSelect={handleStepClick}
        completedSteps={completedSteps}
        agentStatus={status}
        hasErrors={stepErrors}
      />

      {/* Main Step Workspace Container */}
      <div className="rounded-xl border border-white/[0.08] bg-[#000000] p-5 sm:p-7 shadow-[0_1px_4px_rgba(0,0,0,0.6)] relative min-h-[460px] flex flex-col justify-between">
        {/* Subtle Obsidian top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none" />

        {/* Step-Specific Content */}
        <div className="pb-6">
          {currentStep === 1 && (
            <StepProviderSelect
              selectedProvider={provider}
              onProviderSelect={setProvider}
              isProviderConnected={true}
            />
          )}

          {currentStep === 2 && (
            <StepModelSelect
              provider={provider}
              selectedModelId={modelId}
              onModelSelect={setModelId}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              maxTokens={maxTokens}
              onMaxTokensChange={setMaxTokens}
            />
          )}

          {currentStep === 3 && (
            <StepVoiceSelect
              provider={provider}
              selectedVoiceId={voiceId}
              onVoiceSelect={setVoiceId}
              voiceSpeed={voiceSpeed}
              onVoiceSpeedChange={setVoiceSpeed}
              voiceStability={voiceStability}
              onVoiceStabilityChange={setVoiceStability}
            />
          )}

          {currentStep === 4 && (
            <StepPersonaPrompt
              name={name}
              onNameChange={setName}
              speakingStyle={speakingStyle}
              onSpeakingStyleChange={setSpeakingStyle}
              callObjective={callObjective}
              onCallObjectiveChange={setCallObjective}
              openingScript={openingScript}
              onOpeningScriptChange={setOpeningScript}
              agentPersona={agentPersona}
              onAgentPersonaChange={setAgentPersona}
              onApplyPreset={handleApplyPreset}
            />
          )}

          {currentStep === 5 && (
            <StepKnowledgeBase
              approvedTalkingPoints={approvedTalkingPoints}
              onApprovedTalkingPointsChange={setApprovedTalkingPoints}
              prohibitedClaims={prohibitedClaims}
              onProhibitedClaimsChange={setProhibitedClaims}
            />
          )}

          {currentStep === 6 && (
            <StepObjectionHandling
              objectionRules={objectionRules}
              onObjectionRulesChange={setObjectionRules}
            />
          )}

          {currentStep === 7 && (
            <StepQualificationQuestions
              questions={qualificationQuestions}
              onQuestionsChange={setQualificationQuestions}
            />
          )}

          {currentStep === 8 && (
            <StepPhoneNumber
              assignedPhoneNumberId={assignedPhoneNumberId}
              onPhoneNumberSelect={(id, num) => {
                setAssignedPhoneNumberId(id);
                setAssignedPhoneNumber(num || null);
              }}
              agentId={agentId}
              agentStatus={status}
            />
          )}

          {currentStep === 9 && (
            <StepSafetyGuardrails
              safety={safety}
              onSafetyChange={setSafety}
              escalationConditions={escalationConditions}
              onEscalationConditionsChange={setEscalationConditions}
              fallbackBehavior={fallbackBehavior}
              onFallbackBehaviorChange={setFallbackBehavior}
            />
          )}

          {currentStep === 10 && (
            <StepTestConfiguration
              agentId={agentId}
              agentStatus={status}
              testPhoneNumber={testPhoneNumber}
              onTestPhoneNumberChange={setTestPhoneNumber}
              lastTestedAt={lastTestedAt}
              onTestCompleted={handleTestCompleted}
              canRunTest={callObjective.trim().length > 50 && openingScript.trim().length > 0}
              blockerReasons={
                callObjective.trim().length <= 50
                  ? ["System prompt / objective must exceed 50 characters (Step 4)."]
                  : []
              }
            />
          )}

          {currentStep === 11 && (
            <StepReadinessReview
              agent={currentAgentConfig}
              readinessReport={readinessReport}
              onRefreshReadiness={fetchReadiness}
              onActivationSuccess={handleActivationSuccess}
              onPauseSuccess={handlePauseSuccess}
              isSaving={isSaving}
            />
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentStep === 1 || isSaving}
              onClick={handlePrevStep}
              className="h-8.5 px-4 text-xs bg-surface-panel hover:bg-surface-elevated text-zinc-300 border-white/[0.08]"
            >
              ← Previous Step
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSaving}
              onClick={() => saveAgent(false)}
              className="h-8.5 px-3.5 text-xs bg-surface-panel hover:bg-surface-elevated text-zinc-400 hover:text-white border-white/[0.08]"
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>

            {saveSuccessMsg && (
              <span className="text-[11px] font-mono text-[#C6FF33] ml-2 animate-fade-in">
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => router.push("/calling/agents")}
              className="text-xs text-zinc-400 hover:text-white mr-2 cursor-pointer font-sans"
            >
              Exit Studio
            </button>

            {currentStep < 11 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={isSaving}
                className="h-8.5 px-5 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
              >
                Next Step: {STUDIO_STEPS[currentStep]?.shortLabel || "Proceed"} →
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => router.push("/calling/agents")}
                className="h-8.5 px-5 text-xs bg-[#C6FF33] hover:bg-[#b0f020] text-black font-bold shadow-xs"
              >
                Complete &amp; Return to Agents
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
