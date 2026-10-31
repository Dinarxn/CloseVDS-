"use client";

import React, { useState, useEffect } from "react";
import { VoiceAgentProviderType, VoiceModelOption } from "@/types/voice-agent";
import { api } from "@/lib/api-client";

export interface StepModelSelectProps {
  provider: VoiceAgentProviderType;
  selectedModelId: string;
  onModelSelect: (modelId: string) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  maxTokens: number;
  onMaxTokensChange: (tokens: number) => void;
}

const DEFAULT_MODELS_BY_PROVIDER: Record<VoiceAgentProviderType, VoiceModelOption[]> = {
  retell: [
    {
      id: "gpt-4o-realtime",
      provider: "retell",
      name: "OpenAI GPT-4o Realtime Voice",
      description: "Native multimodal speech-to-speech engine optimized for instantaneous conversational turns.",
      contextWindow: 128000,
      recommendedFor: "Live conversational flow with zero transcription latency",
      isDefault: true,
    },
    {
      id: "claude-3-5-sonnet-retell",
      provider: "retell",
      name: "Anthropic Claude 3.5 Sonnet",
      description: "Best-in-class reasoning for nuanced qualification and objection counter-responses.",
      contextWindow: 200000,
      recommendedFor: "High-acuity enterprise B2B sales and technical discussions",
    },
    {
      id: "gpt-4o-mini-retell",
      provider: "retell",
      name: "OpenAI GPT-4o Mini",
      description: "Cost-optimized high-speed model with sub-400ms generation latency.",
      contextWindow: 128000,
      recommendedFor: "High-volume appointment confirmations and short follow-ups",
    },
  ],
  vapi: [
    {
      id: "gpt-4o-vapi",
      provider: "vapi",
      name: "OpenAI GPT-4o (Vapi)",
      description: "Full-capability multimodal flagship with robust function calling during phone calls.",
      contextWindow: 128000,
      recommendedFor: "Standard enterprise outbound workflows",
      isDefault: true,
    },
    {
      id: "claude-3-5-haiku-vapi",
      provider: "vapi",
      name: "Anthropic Claude 3.5 Haiku",
      description: "Ultra-fast response generation tailored for fast-paced phone conversations.",
      contextWindow: 200000,
      recommendedFor: "Rapid lead qualification and fast-turn booking",
    },
    {
      id: "llama-3-3-70b-vapi",
      provider: "vapi",
      name: "Meta Llama 3.3 70B Instruct",
      description: "Open-weight reasoning powerhouse with balanced speed and instruction adherence.",
      contextWindow: 128000,
      recommendedFor: "Cost-sensitive scaling with high factual grounding",
    },
  ],
  mock: [
    {
      id: "mock-model-standard",
      provider: "mock",
      name: "Mock Fast Engine (Deterministic)",
      description: "Internal simulated inference engine for offline development and instant verification.",
      contextWindow: 32000,
      recommendedFor: "Testing, verification, and staging without API costs",
      isDefault: true,
    },
  ],
};

export function StepModelSelect({
  provider,
  selectedModelId,
  onModelSelect,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
}: StepModelSelectProps) {
  const [models, setModels] = useState<VoiceModelOption[]>(
    DEFAULT_MODELS_BY_PROVIDER[provider] || []
  );

  useEffect(() => {
    // Attempt dynamic fetch from backend
    api.voice
      .getStudioModels(provider)
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setModels(res.data);
        } else {
          setModels(DEFAULT_MODELS_BY_PROVIDER[provider] || []);
        }
      })
      .catch(() => {
        setModels(DEFAULT_MODELS_BY_PROVIDER[provider] || []);
      });
  }, [provider]);

  // Ensure current model is valid for provider
  useEffect(() => {
    if (models.length > 0 && !models.some((m) => m.id === selectedModelId)) {
      onModelSelect(models[0].id);
    }
  }, [models, selectedModelId, onModelSelect]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Step 2: Large Language Model Configuration
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Select the cognitive reasoning model that interprets caller input and generates context-grounded responses in real-time.
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((model) => {
          const isSelected = selectedModelId === model.id;

          return (
            <div
              key={model.id}
              onClick={() => onModelSelect(model.id)}
              className={`rounded-xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "bg-violet-950/30 border-violet-500/80 shadow-[0_0_16px_rgba(125,57,235,0.2)]"
                  : "bg-surface-panel/50 border-white/[0.08] hover:border-white/[0.2] hover:bg-surface-panel"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                    {(model.contextWindow / 1000).toFixed(0)}k Context
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-violet-400 bg-violet-600"
                        : "border-zinc-600 bg-zinc-900"
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white">{model.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {model.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/[0.06] text-[11px] text-zinc-400">
                <span className="text-zinc-500 block text-[10px] uppercase font-mono font-semibold">
                  Recommended For
                </span>
                <span className="text-zinc-300 text-xs font-medium mt-0.5 block">
                  {model.recommendedFor}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Temperature & Token Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Temperature slider */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Temperature</span>
              <span className="text-[11px] text-zinc-400">
                Lower = more deterministic & factual; Higher = more varied phrasing.
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#C6FF33] px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/25">
              {temperature.toFixed(2)}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>0.0 (Strict / Scripted)</span>
            <span>0.7 (Default Balance)</span>
            <span>1.0 (Creative)</span>
          </div>
        </div>

        {/* Max Tokens slider */}
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Max Turn Tokens</span>
              <span className="text-[11px] text-zinc-400">
                Limits response length per spoken turn to prevent lengthy monologues.
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-violet-300 px-2 py-0.5 rounded bg-violet-950/40 border border-violet-500/30">
              {maxTokens} tokens
            </span>
          </div>

          <input
            type="range"
            min="100"
            max="1200"
            step="50"
            value={maxTokens}
            onChange={(e) => onMaxTokensChange(parseInt(e.target.value, 10))}
            className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>100 (~2 sentences)</span>
            <span>400 (~4-5 sentences)</span>
            <span>1200 (Long narrative)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
