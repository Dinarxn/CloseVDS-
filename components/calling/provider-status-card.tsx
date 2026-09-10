"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card variant="standard" className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>External Telephony &amp; AI Providers</CardTitle>
          <Badge variant="outline" size="sm">Infrastructure Status</Badge>
        </div>
        <CardDescription>
          Real provider connection status reporting directly from the server. Outbound calling remains locked until providers are manually provisioned.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-xs text-zinc-400 animate-pulse">
            Querying provider registry status...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Twilio Telephony Card */}
            <div className="p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between space-y-2.5 hover:border-white/[0.12] transition-colors">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  Twilio Telephony
                </span>
                {twilioConfigured ? (
                  <Badge variant="success" size="sm" dot>Configured</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Not Configured</Badge>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[36px]">
                {twilioConfigured
                  ? "Twilio credentials verified for outbound SIP / PSTN trunking."
                  : "Twilio credentials are not configured. Outbound calls are safety-locked."}
              </p>
              <div className="text-[10px] text-zinc-500 font-mono pt-1.5 border-t border-white/[0.04] truncate">
                Provider: Twilio • Category: CALLING
              </div>
            </div>

            {/* Voice AI Provider Card */}
            <div className="p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between space-y-2.5 hover:border-white/[0.12] transition-colors">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  Voice AI Engine
                </span>
                {voiceAiConfigured ? (
                  <Badge variant="success" size="sm" dot>Configured</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Not Configured</Badge>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[36px]">
                {voiceAiConfigured
                  ? "LLM reasoning and conversation turn engine connected."
                  : "Voice AI provider credentials not configured. Synthetic mock calls prohibited."}
              </p>
              <div className="text-[10px] text-zinc-500 font-mono pt-1.5 border-t border-white/[0.04] truncate">
                Engine: StandardVoiceAI • Grounding: ON
              </div>
            </div>

            {/* n8n Automation Gateway Card */}
            <div className="p-3.5 rounded-xl bg-[#0d0d12] border border-white/[0.06] flex flex-col justify-between space-y-2.5 hover:border-white/[0.12] transition-colors">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  n8n Gateway
                </span>
                {n8nConnected ? (
                  <Badge variant="success" size="sm" dot>
                    {n8nActiveKeysCount} {n8nActiveKeysCount === 1 ? "Key" : "Keys"}
                  </Badge>
                ) : (
                  <Badge variant="outline" size="sm">Not Connected</Badge>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed min-h-[36px]">
                {n8nConnected
                  ? "Workspace integration active. Zero-bypass approval gate enforced on all inbound requests."
                  : "No active n8n integration keys generated for this workspace."}
              </p>
              <div className="text-[10px] text-zinc-500 font-mono pt-1.5 border-t border-white/[0.04] truncate">
                Protocol: REST + HMAC-SHA256
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
