"use client";

import React from "react";
import { ProviderStatusItem } from "@/types/calling";

export interface ProviderStatusCardProps {
  providers?: ProviderStatusItem[];
  n8nActiveKeysCount?: number;
  isLoading?: boolean;
}

export function ProviderStatusCard({
  providers = [],
  n8nActiveKeysCount = 0,
  isLoading = false,
}: ProviderStatusCardProps) {
  // Extract Twilio status
  const twilio = providers.find((p) => p.provider.toLowerCase().includes("twilio"));
  const twilioConfigured = Boolean(twilio?.isConfigured);

  // Extract Voice AI / LLM status
  const voiceAi = providers.find((p) => p.category === "AI_LLM");
  const voiceAiConfigured = Boolean(voiceAi?.isConfigured);

  // n8n status
  const n8nConnected = n8nActiveKeysCount > 0;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.08] hover:border-white/[0.12] p-5 shadow-xs transition-colors">
      {/* Top hairline highlight */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white tracking-tight">External Telephony &amp; AI Providers</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
            Infrastructure Status
          </span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Real provider connection status reporting directly from the server. Outbound calling remains locked until providers are manually provisioned.
        </p>
      </div>

      <div>
        {isLoading ? (
          <div className="py-6 text-center text-xs text-zinc-400 font-mono animate-pulse">
            Querying provider registry status...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Twilio Telephony Card */}
            <div className="p-3.5 rounded-xl bg-[#08080d] border border-white/[0.06] flex flex-col justify-between space-y-2.5 hover:border-white/[0.12] transition-colors shadow-xs">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  Twilio Telephony
                </span>
                {twilioConfigured ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Configured
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[36px]">
                {twilioConfigured
                  ? "Twilio credentials verified for outbound SIP / PSTN trunking."
                  : "Twilio credentials are not configured. Outbound calls are safety-locked."}
              </p>
              <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-white/[0.04] truncate">
                Provider: Twilio • Category: CALLING
              </div>
            </div>

            {/* Voice AI Provider Card */}
            <div className="p-3.5 rounded-xl bg-[#08080d] border border-white/[0.06] flex flex-col justify-between space-y-2.5 hover:border-white/[0.12] transition-colors shadow-xs">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  Voice AI Engine
                </span>
                {voiceAiConfigured ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Configured
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[36px]">
                {voiceAiConfigured
                  ? "LLM reasoning and conversation turn engine connected."
                  : "Voice AI provider credentials not configured. Synthetic mock calls prohibited."}
              </p>
              <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-white/[0.04] truncate">
                Engine: StandardVoiceAI • Grounding: ON
              </div>
            </div>

            {/* n8n Automation Gateway Card */}
            <div className="p-3.5 rounded-xl bg-[#08080d] border border-white/[0.06] flex flex-col justify-between space-y-2.5 hover:border-white/[0.12] transition-colors shadow-xs">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  n8n Gateway
                </span>
                {n8nConnected ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium inline-flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    {n8nActiveKeysCount} {n8nActiveKeysCount === 1 ? "Key" : "Keys"}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06] font-medium">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[36px]">
                {n8nConnected
                  ? "Workspace integration active. Zero-bypass approval gate enforced on all inbound requests."
                  : "No active n8n integration keys generated for this workspace."}
              </p>
              <div className="text-[10px] text-zinc-500 font-mono pt-2 border-t border-white/[0.04] truncate">
                Protocol: REST + HMAC-SHA256
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
