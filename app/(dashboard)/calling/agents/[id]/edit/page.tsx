"use client";

import React, { useState, useEffect, use } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { VoiceAgentStudioWizard } from "@/components/calling";
import { VoiceAgentStudioConfig } from "@/types/voice-agent";
import { api, ApiClientError } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";

interface EditVoiceAgentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditVoiceAgentPage({ params }: EditVoiceAgentPageProps) {
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
          setErrorMsg("Failed to load voice agent studio configuration.");
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
        <PageHeader
          title={agent ? `Voice Agent Studio: ${agent.name}` : "Voice Agent Studio"}
          description="Guided 11-step studio editor. Modify models, voices, talking points, safety limits, and run diagnostic test calls."
          breadcrumbs={[
            { label: "Workspace", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Voice Agents", href: "/calling/agents" },
            { label: agent?.name || "Edit Studio Agent" },
          ]}
        />

        {errorMsg && (
          <Alert variant="destructive" title="Loading Error">
            {errorMsg}
          </Alert>
        )}

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-xs">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-mono">Loading Voice Agent Studio configuration...</p>
          </div>
        ) : agent ? (
          <VoiceAgentStudioWizard initialAgent={agent} agentId={id} />
        ) : (
          <div className="p-8 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card font-mono">
            Voice agent configuration not found.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
