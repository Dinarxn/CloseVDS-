"use client";

import React from "react";
import { AiProviderConfig, SupportedAiProvider } from "@/types/settings";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface AiProviderTabProps {
  ai: AiProviderConfig;
  onChange: (field: keyof AiProviderConfig, value: unknown) => void;
}

export function AiProviderTab({ ai, onChange }: AiProviderTabProps) {
  return (
    <div className="space-y-5">
      {/* 1. Policy Notice — Technical Governance Panel */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-subtle p-4 flex items-start gap-3.5 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" aria-hidden="true" />
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0 mt-0.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-200">
              Provider Abstraction &amp; Secret Isolation Policy
            </h5>
            <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              AIR-GAPPED CREDENTIALS
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            closeVDS uses a strict provider abstraction layer (<code className="font-mono text-[11px] text-zinc-300 bg-white/[0.06] px-1 py-0.5 rounded">AIService</code>). API credentials and secrets are NEVER handled or stored in the browser. In Phase 2, backend environment secrets will authenticate directly with selected providers.
          </p>
        </div>
      </div>

      {/* 2. Active AI Service Provider */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-subtle p-5 space-y-4 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" aria-hidden="true" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Active AI Service Provider
            </h4>
          </div>
          <span className="font-mono text-[10px] text-zinc-500">INFERENCE ROUTER</span>
        </div>

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

      {/* 3. Anti-Hallucination & Generation Guardrails */}
      <div className="relative overflow-hidden rounded-xl bg-surface-card border border-subtle p-5 space-y-4 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent pointer-events-none" aria-hidden="true" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              Anti-Hallucination &amp; Generation Guardrails
            </h4>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            ACTIVE GROUNDING
          </span>
        </div>

        <div className="space-y-4">
          <Checkbox
            id="ai-strict-guard"
            label="Strict Anti-Hallucination Grounding"
            checked={ai.strictAntiHallucination}
            onChange={(e) => onChange("strictAntiHallucination", e.target.checked)}
            description="Enforces that all personalized claims and observations in generated copy MUST cite verifiable facts extracted from the prospect's website audit."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
