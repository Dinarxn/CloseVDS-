"use client";

import React, { useState, useEffect } from "react";
import { VoiceAgentProviderType, VoiceOption } from "@/types/voice-agent";
import { api } from "@/lib/api-client";

export interface StepVoiceSelectProps {
  provider: VoiceAgentProviderType;
  selectedVoiceId: string;
  onVoiceSelect: (voiceId: string) => void;
  voiceSpeed?: number;
  onVoiceSpeedChange?: (speed: number) => void;
  voiceStability?: number;
  onVoiceStabilityChange?: (stability: number) => void;
}

const DEFAULT_VOICES_BY_PROVIDER: Record<VoiceAgentProviderType, VoiceOption[]> = {
  retell: [
    {
      id: "retell-eleven-sarah",
      provider: "retell",
      name: "Sarah (Empathetic & Clear)",
      gender: "female",
      accent: "American",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/sarah-sample.mp3",
      sampleRateHz: 24000,
      tags: ["Empathetic", "Professional", "Healthcare & Services"],
    },
    {
      id: "retell-rajesh-hindi",
      provider: "retell",
      name: "Rajesh (Hindi & Indian English)",
      gender: "male",
      accent: "Indian",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/rajesh-sample.mp3",
      sampleRateHz: 24000,
      tags: ["Multilingual", "Hindi", "Regional Growth"],
    },
    {
      id: "retell-david-executive",
      provider: "retell",
      name: "David (Authoritative B2B)",
      gender: "male",
      accent: "American",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/david-sample.mp3",
      sampleRateHz: 24000,
      tags: ["Authoritative", "Enterprise", "High Ticket"],
    },
  ],
  vapi: [
    {
      id: "vapi-neets-marcus",
      provider: "vapi",
      name: "Marcus (Energetic Executive)",
      gender: "male",
      accent: "American",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/marcus-sample.mp3",
      sampleRateHz: 24000,
      tags: ["High-Energy", "Executive", "Fast-Paced"],
    },
    {
      id: "vapi-azure-elena",
      provider: "vapi",
      name: "Elena (Warm Consultant)",
      gender: "female",
      accent: "British",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/elena-sample.mp3",
      sampleRateHz: 24000,
      tags: ["Warm", "Articulate", "Fintech & Advisory"],
    },
    {
      id: "vapi-playht-priya",
      provider: "vapi",
      name: "Priya (Indian English Conversational)",
      gender: "female",
      accent: "Indian",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/priya-sample.mp3",
      sampleRateHz: 24000,
      tags: ["Conversational", "South Asia", "Friendly"],
    },
  ],
  mock: [
    {
      id: "mock-voice-neutral-1",
      provider: "mock",
      name: "Mock Voice (Deterministic)",
      gender: "neutral",
      accent: "Standard",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/mock-neutral.mp3",
      sampleRateHz: 16000,
      tags: ["Offline Fixture", "Deterministic"],
    },
    {
      id: "mock-voice-alex",
      provider: "mock",
      name: "Mock Voice Alex",
      gender: "male",
      accent: "American",
      previewAudioUrl: "https://cdn.closevds.com/audio/samples/mock-alex.mp3",
      sampleRateHz: 16000,
      tags: ["Development Test"],
    },
  ],
};

export function StepVoiceSelect({
  provider,
  selectedVoiceId,
  onVoiceSelect,
  voiceSpeed = 1.0,
  onVoiceSpeedChange,
  voiceStability = 0.75,
  onVoiceStabilityChange,
}: StepVoiceSelectProps) {
  const [voices, setVoices] = useState<VoiceOption[]>(
    DEFAULT_VOICES_BY_PROVIDER[provider] || []
  );
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  useEffect(() => {
    api.voice
      .getStudioVoices(provider)
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setVoices(res.data);
        } else {
          setVoices(DEFAULT_VOICES_BY_PROVIDER[provider] || []);
        }
      })
      .catch(() => {
        setVoices(DEFAULT_VOICES_BY_PROVIDER[provider] || []);
      });
  }, [provider]);

  useEffect(() => {
    if (voices.length > 0 && !voices.some((v) => v.id === selectedVoiceId)) {
      onVoiceSelect(voices[0].id);
    }
  }, [voices, selectedVoiceId, onVoiceSelect]);

  const togglePreview = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voiceId);
      // Automatically stop preview after 4 seconds simulated preview
      setTimeout(() => {
        setPlayingVoiceId((curr) => (curr === voiceId ? null : curr));
      }, 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Step 3: Voice Persona &amp; Acoustic Profile
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Select the auditory persona, accent calibration, and speech pacing. Listen to audio previews to confirm natural resonance.
        </p>
      </div>

      {/* Voice cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {voices.map((voice) => {
          const isSelected = selectedVoiceId === voice.id;
          const isPlaying = playingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onVoiceSelect(voice.id)}
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                      {voice.gender.toUpperCase()}
                    </span>
                    {voice.accent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-500/30">
                        {voice.accent}
                      </span>
                    )}
                  </div>

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
                  <h4 className="text-sm font-semibold text-white">{voice.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {voice.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-400 border border-white/[0.05]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio Preview button */}
              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePreview(voice.id);
                  }}
                  className={`h-7 px-3 text-xs rounded-lg font-mono flex items-center gap-1.5 border transition-all ${
                    isPlaying
                      ? "bg-[#C6FF33] text-black border-lime-400 font-bold animate-pulse shadow-[0_0_8px_rgba(198,255,51,0.4)]"
                      : "bg-surface-elevated text-zinc-300 border-white/[0.08] hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <span className="w-2 h-2 rounded-xs bg-black" />
                      <span>Playing Sample...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px]">▶</span>
                      <span>Audio Preview</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] font-mono text-zinc-500">
                  {voice.sampleRateHz ? `${voice.sampleRateHz / 1000}kHz` : "24kHz"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speed and stability controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Speech Pacing (Speed)</span>
              <span className="text-[11px] text-zinc-400">
                Pacing multiplier. Recommended: 1.0x for conversational clarity.
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-violet-300 px-2 py-0.5 rounded bg-violet-950/40 border border-violet-500/30">
              {voiceSpeed.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min="0.8"
            max="1.3"
            step="0.05"
            value={voiceSpeed}
            onChange={(e) => onVoiceSpeedChange?.(parseFloat(e.target.value))}
            className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>0.8x (Deliberate)</span>
            <span>1.0x (Natural)</span>
            <span>1.3x (Fast-Paced)</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Acoustic Stability</span>
              <span className="text-[11px] text-zinc-400">
                Higher = more consistent tone; Lower = more emotional variation.
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[#C6FF33] px-2 py-0.5 rounded bg-lime-500/10 border border-lime-500/25">
              {(voiceStability * 100).toFixed(0)}%
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={voiceStability}
            onChange={(e) => onVoiceStabilityChange?.(parseFloat(e.target.value))}
            className="w-full accent-violet-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>20% (Expressive)</span>
            <span>75% (Balanced)</span>
            <span>100% (Strict Uniform)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
