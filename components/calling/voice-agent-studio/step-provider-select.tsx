"use client";

import React from "react";
import { VoiceAgentProviderType } from "@/types/voice-agent";

export interface StepProviderSelectProps {
  selectedProvider: VoiceAgentProviderType;
  onProviderSelect: (provider: VoiceAgentProviderType) => void;
  isProviderConnected?: boolean;
}

interface ProviderCardInfo {
  id: VoiceAgentProviderType;
  title: string;
  badge: string;
  description: string;
  features: string[];
  latencyBenchmark: string;
  recommendedUse: string;
}

const PROVIDERS: ProviderCardInfo[] = [
  {
    id: "retell",
    title: "Retell AI Engine",
    badge: "Low Latency Benchmark",
    description: "Enterprise voice AI pipeline with sub-600ms roundtrip audio synthesis and native barge-in detection.",
    features: [
      "Ultra-low latency conversational turn processing (<600ms)",
      "Native barge-in and human speech interruption handling",
      "Direct integration with ElevenLabs and Deepgram Nova-2",
      "Automatic ambient noise cancellation and voice activity detection",
    ],
    latencyBenchmark: "~520ms avg",
    recommendedUse: "High-volume outbound SDR and client booking calls",
  },
  {
    id: "vapi",
    title: "Vapi AI Orchestrator",
    badge: "Multi-Model Flexibility",
    description: "Versatile orchestration layer supporting dynamic tool calling, custom webhooks, and multi-model switching.",
    features: [
      "Multi-LLM dynamic model selection (GPT-4o, Claude 3.5, Llama 3.3)",
      "Poly-voice routing across Azure Neural, Neets, and PlayHT",
      "Custom function execution during active telephone sessions",
      "Mid-call agent transfer and SIP carrier trunking support",
    ],
    latencyBenchmark: "~680ms avg",
    recommendedUse: "Complex qualification logic and multi-tier booking flows",
  },
  {
    id: "mock",
    title: "CloseVDS Mock Telephony Engine",
    badge: "Offline / Deterministic Testing",
    description: "Built-in deterministic test engine for pipeline verification, offline simulation, and CI unit tests without telephony costs.",
    features: [
      "Zero external API dependencies or cloud carrier billings",
      "Deterministic conversation simulation and script validation",
      "Instant test call progression to TESTED lifecycle status",
      "Ideal for pre-flight testing and regression audits",
    ],
    latencyBenchmark: "~15ms internal",
    recommendedUse: "Offline development, staging environments, and verification",
  },
];

export function StepProviderSelect({
  selectedProvider,
  onProviderSelect,
}: StepProviderSelectProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Step 1: AI Voice Provider Selection
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Select the underlying speech synthesis and telephony runtime for this agent. CloseVDS decouples prompts from providers, allowing seamless migration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PROVIDERS.map((provider) => {
          const isSelected = selectedProvider === provider.id;

          return (
            <div
              key={provider.id}
              onClick={() => onProviderSelect(provider.id)}
              className={`rounded-xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "bg-violet-950/30 border-violet-500/80 shadow-[0_0_16px_rgba(125,57,235,0.2)]"
                  : "bg-surface-panel/50 border-white/[0.08] hover:border-white/[0.2] hover:bg-surface-panel"
              }`}
            >
              {/* Active selection accent line */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                    {provider.badge}
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
                  <h4 className="text-sm font-semibold text-white">{provider.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {provider.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-semibold">
                    Core Capabilities
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-300">
                    {provider.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug">
                        <span className="text-violet-400 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-500">Latency:</span>
                <span className={isSelected ? "text-[#C6FF33] font-semibold" : "text-zinc-300"}>
                  {provider.latencyBenchmark}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C6FF33] animate-pulse" />
          <span className="text-zinc-300">
            Selected Provider: <strong className="text-white uppercase">{selectedProvider}</strong>
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Step 1 satisfies backend provider connection verification
        </span>
      </div>
    </div>
  );
}
