"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { VoiceAgentCard } from "@/components/calling";
import { VoiceAgentStudioConfig } from "@/types/voice-agent";
import { api, ApiClientError } from "@/lib/api-client";

export default function VoiceAgentsPage() {
  const [agents, setAgents] = useState<VoiceAgentStudioConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.voice.listStudioAgents();
      if (res?.data) {
        setAgents(res.data);
      }
    } catch {
      // Graceful fallback to legacy getAgentConfigs
      try {
        const legacyRes = await api.voice.getAgentConfigs();
        if (legacyRes?.data) {
          setAgents(legacyRes.data as unknown as VoiceAgentStudioConfig[]);
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Failed to load Voice Agent configurations.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <PageHeader
            title="AI Voice Agents &amp; Studio"
            description="Manage conversational personas, 11-step studio configurations, qualification criteria, and activation readiness gating."
            breadcrumbs={[
              { label: "Workspace", href: "/dashboard" },
              { label: "AI Calling", href: "/calling" },
              { label: "Voice Agents" },
            ]}
          />

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link href="/calling/agents/new">
              <Button
                variant="primary"
                size="sm"
                className="h-8.5 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Launch Voice Agent Studio
              </Button>
            </Link>
          </div>
        </div>

        {/* Factual Grounding Governance Banner */}
        <div className="relative rounded-xl border border-amber-500/25 bg-[#120e09]/90 px-4 py-3.5 sm:px-5 sm:py-4 shadow-xs overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent pointer-events-none" />
          <div className="flex items-start gap-3 sm:gap-3.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-500/90 font-semibold">
                  Governance Protocol
                </span>
                <span className="text-zinc-600 font-mono text-[10px]">•</span>
                <span className="text-xs font-medium text-amber-200">
                  Strict Pre-Activation Readiness Gate Enforced
                </span>
              </div>
              <p className="text-xs text-amber-200/75 leading-relaxed max-w-4xl font-sans">
                Voice agents cannot be activated merely via UI button click. Activation requires verified provider connectivity, objective prompt exceeding 50 characters, assigned carrier line with verified voice capabilities, and successful test call execution.
              </p>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="relative rounded-xl border border-rose-500/30 bg-[#140b0e] p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-rose-300">Service Communication Error</h4>
              <p className="text-xs text-rose-200/80 leading-relaxed font-sans">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Workspace Body */}
        {isLoading ? (
          <div className="relative p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Loading voice agent configurations...
            </p>
          </div>
        ) : agents.length === 0 ? (
          <div className="relative p-10 sm:p-14 text-center border border-white/[0.08] rounded-xl bg-surface-card space-y-3.5 shadow-xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-surface-panel border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Voice Agent Configuration
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                No voice agents configured
              </h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed font-sans">
                Launch the guided 11-step Voice Agent Studio to build, test, and activate your first conversational AI persona.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/calling/agents/new">
                <Button variant="primary" size="sm" className="h-8.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Launch Voice Agent Studio
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <VoiceAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
