"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface CallingReadinessProps {
  configuredProvidersCount: number;
  hasAgentConfig: boolean;
  isLoading: boolean;
}

export function CallingReadiness({
  configuredProvidersCount,
  hasAgentConfig,
  isLoading,
}: CallingReadinessProps) {
  const isReadyForCalls = configuredProvidersCount > 0 && hasAgentConfig;

  const reasons: string[] = [];
  if (configuredProvidersCount === 0) {
    reasons.push("Voice telephony carrier (Twilio / Retell) is not configured in settings");
  }
  if (!hasAgentConfig) {
    reasons.push("AI Voice Agent dialogue persona & knowledge boundaries are not configured");
  }

  const modules = [
    {
      id: "provider",
      label: "Voice Provider",
      status: isLoading
        ? "Checking..."
        : configuredProvidersCount > 0
        ? `${configuredProvidersCount} Configured`
        : "Not Configured",
      variant: configuredProvidersCount > 0 ? ("success" as const) : ("secondary" as const),
      desc: "Telephony carrier & WebRTC gateway",
      route: "/calling/settings",
    },
    {
      id: "agent",
      label: "AI Voice Agent",
      status: isLoading ? "Checking..." : hasAgentConfig ? "Ready" : "Not Configured",
      variant: hasAgentConfig ? ("success" as const) : ("secondary" as const),
      desc: "Dialogue script & prompt enclosure",
      route: "/calling/settings",
    },
    {
      id: "approval",
      label: "Human Approval",
      status: "Enforced",
      variant: "violet" as const,
      desc: "Mandatory operator sign-off per dial",
      route: "/calling/calls",
    },
    {
      id: "safety",
      label: "Safety Enclosure",
      status: "18 Gates Active",
      variant: "success" as const,
      desc: "Grounded context & DNC protection",
      route: "/settings",
    },
  ];

  return (
    <div className="relative rounded-xl p-5 bg-surface-panel border border-white/[0.08] shadow-xs space-y-4 overflow-hidden">
      {/* Specular Top Hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isReadyForCalls
                  ? "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.8)]"
                  : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-semibold">
              Pre-Flight Validation
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">AI Calling Readiness</h3>
          <p className="text-xs text-[#8E8E9F] mt-0.5 leading-relaxed">
            Verify telephony, agent persona, human approval, and safety boundaries before outbound calling.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Link href="/calling/settings">
            <button className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-card-hover border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono text-[#CBCBD6] hover:text-white transition-all cursor-pointer shadow-xs active:scale-[0.98]">
              Calling Settings
            </button>
          </Link>
          <Link href="/calling">
            <button className="px-3.5 py-1.5 rounded-lg bg-[#7D39EB] hover:bg-[#6C2FD1] text-white border border-[#8F52F5] text-xs font-semibold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(125,57,235,0.3)] active:scale-[0.98]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_#C6FF33]" />
              <span>Open AI Calling</span>
              <span className="text-xs">→</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Monochromatic Technical Diagnostic Status Banner */}
      <div className="p-4 rounded-xl bg-surface-card border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full mt-1 sm:mt-0 shrink-0 ${
              isReadyForCalls
                ? "bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.8)]"
                : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            }`}
          />
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              {isLoading
                ? "CALLING STATUS: EVALUATING PRE-FLIGHT CHECKS..."
                : isReadyForCalls
                ? "CALLING STATUS: READY FOR DISPATCH"
                : "CALLING STATUS: NOT READY"}
            </p>
            {!isReadyForCalls && reasons.length > 0 && (
              <ul className="text-xs text-[#8E8E9F] mt-1.5 list-disc list-inside space-y-0.5 font-mono">
                {reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
            {isReadyForCalls && (
              <p className="text-xs text-[#8E8E9F] mt-1 font-mono">
                All pre-flight checks verified. In-flight outbound dialing safety active.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <span
            className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border font-semibold tracking-wider ${
              isReadyForCalls
                ? "bg-[#C6FF33]/15 text-[#C6FF33] border-[#C6FF33]/30"
                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
            }`}
          >
            {isReadyForCalls ? "Clear to Call" : "Setup Required"}
          </span>
        </div>
      </div>

      {/* 4 Readiness Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={mod.route}
            className="group relative p-3.5 bg-surface-card hover:bg-surface-card-hover border border-white/[0.07] hover:border-white/[0.18] rounded-xl flex flex-col justify-between space-y-2.5 transition-all duration-150 block hover:-translate-y-0.5 shadow-xs"
          >
            {/* Top hairline highlight on hover */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#8E8E9F] uppercase tracking-widest font-semibold group-hover:text-[#CBCBD6] transition-colors">
                {mod.label}
              </span>
              <Badge variant={mod.variant} size="sm" className="font-mono text-[9px]">
                {mod.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-semibold text-white tracking-tight group-hover:text-[#B788FF] transition-colors">
                {mod.label}
              </p>
              <p className="text-[11px] text-[#8E8E9F] leading-relaxed mt-0.5 group-hover:text-[#CBCBD6] transition-colors">
                {mod.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
