"use client";

import React from "react";
import { AiProviderConfig, SupportedAiProvider } from "@/types/settings";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";

export interface AiProviderTabProps {
  ai: AiProviderConfig;
  onChange: (field: keyof AiProviderConfig, value: unknown) => void;
}

export function AiProviderTab({ ai, onChange }: AiProviderTabProps) {
  return (
    <div className="space-y-6">
      <Alert variant="default" title="Provider Abstraction & Secret Isolation Policy">
        closeVDS uses a strict provider abstraction layer (`AIService`). API credentials and secrets are NEVER handled or stored in the browser. In Phase 2, backend environment secrets will authenticate directly with selected providers.
      </Alert>

      {/* Provider Selector */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Active AI Service Provider
        </h4>

        <div className="space-y-4">
          <Select
            id="ai-provider-select"
            label="Selected AI Engine"
            value={ai.activeProvider}
            onChange={(e) => onChange("activeProvider", e.target.value as SupportedAiProvider)}
            options={[
              { value: "gemini", label: "Google Gemini (Free tier recommended)" },
              { value: "groq", label: "Groq (Ultra low-latency Llama 3 models)" },
              { value: "openrouter", label: "OpenRouter (Multi-model provider routing)" },
            ]}
            helperText="Directs prompt execution for lead qualification, gap analysis, and copy personalization."
          />

          {ai.activeProvider === "gemini" && (
            <Input
              id="ai-model-gemini"
              label="Gemini Model Identifier"
              value={ai.geminiModel}
              onChange={(e) => onChange("geminiModel", e.target.value)}
              helperText="Default: gemini-2.5-flash for cost-efficient structured gap analysis."
            />
          )}

          {ai.activeProvider === "groq" && (
            <Input
              id="ai-model-groq"
              label="Groq Model Identifier"
              value={ai.groqModel}
              onChange={(e) => onChange("groqModel", e.target.value)}
              helperText="Default: llama-3.3-70b-versatile for high throughput."
            />
          )}

          {ai.activeProvider === "openrouter" && (
            <Input
              id="ai-model-openrouter"
              label="OpenRouter Model Identifier"
              value={ai.openrouterModel}
              onChange={(e) => onChange("openrouterModel", e.target.value)}
              helperText="Default: anthropic/claude-3.5-sonnet."
            />
          )}
        </div>
      </div>

      {/* Guardrails & Hyperparameters */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Anti-Hallucination &amp; Generation Guardrails
        </h4>

        <div className="space-y-4">
          <Checkbox
            id="ai-strict-guard"
            label="Strict Anti-Hallucination Grounding"
            checked={ai.strictAntiHallucination}
            onChange={(e) => onChange("strictAntiHallucination", e.target.checked)}
            description="Enforces that all personalized claims and observations in generated copy MUST cite verifiable facts extracted from the prospect's website audit."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              id="ai-temperature"
              label="Sampling Temperature (0.0 – 1.0)"
              type="number"
              value={ai.temperature.toString()}
              onChange={(e) => onChange("temperature", parseFloat(e.target.value) || 0)}
              helperText="Lower values (0.1–0.3) ensure factual, deterministic gap extraction."
            />

            <Input
              id="ai-max-tokens"
              label="Max Tokens per Generation"
              type="number"
              value={ai.maxTokensPerPrompt.toString()}
              onChange={(e) => onChange("maxTokensPerPrompt", parseInt(e.target.value, 10) || 0)}
              helperText="Limits output length to ensure concise cold emails (100–150 words)."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
