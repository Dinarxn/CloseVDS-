"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { VoiceAgentStudioConfig } from "@/types/voice-agent";
import { api, ApiClientError } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { formatCallDuration } from "@/lib/mappers";

interface ViewVoiceAgentPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewVoiceAgentPage({ params }: ViewVoiceAgentPageProps) {
  const { id } = use(params);

  const [agent, setAgent] = useState<VoiceAgentStudioConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await api.voice.getStudioAgent(id);
        if (res?.data) {
          setAgent(res.data);
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Failed to load voice agent details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <PageHeader
            title={agent ? agent.name : "Voice Agent Details"}
            description="Inspect active persona parameters, qualification criteria, and readiness report."
            breadcrumbs={[
              { label: "Workspace", href: "/dashboard" },
              { label: "AI Calling", href: "/calling" },
              { label: "Voice Agents", href: "/calling/agents" },
              { label: agent?.name || id },
            ]}
          />

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link href={`/calling/agents/${id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                className="h-8.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
              >
                Open Studio Editor
              </Button>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
        )}

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-xs">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-mono">Loading voice agent details...</p>
          </div>
        ) : agent ? (
          <div className="space-y-5">
            {/* Overview Card */}
            <div className="rounded-xl border border-white/[0.08] bg-[#000000] p-6 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      agent.status === "ACTIVE"
                        ? "bg-[#C6FF33]/15 text-[#C6FF33] border-lime-500/30"
                        : agent.status === "TESTED"
                        ? "bg-violet-950/40 text-violet-300 border-violet-500/40"
                        : "bg-surface-elevated text-zinc-400 border-white/[0.08]"
                    }`}
                  >
                    {agent.status}
                  </span>
                  <span className="text-zinc-600 font-mono text-xs">•</span>
                  <span className="text-xs font-mono text-zinc-400 uppercase">
                    Provider: {agent.provider}
                  </span>
                  <span className="text-zinc-600 font-mono text-xs">•</span>
                  <span className="text-xs font-mono text-zinc-400">
                    Model: {agent.modelId}
                  </span>
                </div>

                <span className="text-xs font-mono text-zinc-400">
                  Max Duration: {formatCallDuration(agent.safety?.maxDurationSeconds || 300)}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-semibold">
                  Call Objective / System Prompt
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                  {agent.callObjective}
                </p>
              </div>

              <div className="p-3.5 bg-surface-panel rounded-xl border border-white/[0.06] space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-semibold">
                  Opening Script Hook
                </span>
                <p className="text-zinc-300 italic leading-relaxed font-sans">
                  &quot;{agent.openingScript}&quot;
                </p>
              </div>
            </div>

            {/* Metrics and configuration summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-surface-card space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                  Assigned Phone Line
                </span>
                <span className="text-sm font-bold font-mono text-white">
                  {agent.assignedPhoneNumber || "None Assigned"}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-surface-card space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                  Voice Timbre
                </span>
                <span className="text-sm font-bold text-white truncate block">
                  {agent.voiceId}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-white/[0.08] bg-surface-card space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                  Last Test Verified
                </span>
                <span className="text-xs font-mono text-[#C6FF33] font-semibold block">
                  {agent.lastTestedAt ? new Date(agent.lastTestedAt).toLocaleString() : "Not Tested Yet"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card font-mono">
            Voice agent configuration not found.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
