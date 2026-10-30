"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { VoiceAgentForm } from "@/components/calling";
import { CreateVoiceAgentConfigInput, VoiceAgentConfig } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface EditVoiceAgentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditVoiceAgentPage({ params }: EditVoiceAgentPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [agent, setAgent] = useState<VoiceAgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchAgent = async () => {
      setIsLoading(true);
      try {
        const res = await api.voice.getAgentConfig(id);
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

  const handleSubmit = async (data: CreateVoiceAgentConfigInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.voice.updateAgentConfig(id, data);
      addToast({
        title: "Voice Agent Updated",
        description: `Agent ${data.name} updated successfully.`,
        variant: "success",
      });
      router.push("/calling/agents");
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to update voice agent configuration.";
      setErrorMsg(msg);
      addToast({
        title: "Update Failed",
        description: msg,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6 max-w-4xl">
        <PageHeader
          title={agent ? `Edit Agent: ${agent.name}` : "Edit Voice Agent"}
          description="Update conversational goals, script hooks, qualification questions, and prohibited claims."
          breadcrumbs={[
            { label: "Workspace", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Voice Agents", href: "/calling/agents" },
            { label: "Edit Agent" },
          ]}
        />

        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
        )}

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-xs">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-mono">Loading voice agent configuration...</p>
          </div>
        ) : agent ? (
          <VoiceAgentForm
            initialData={agent}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="p-8 text-center text-xs text-zinc-400 border border-white/[0.08] rounded-xl bg-surface-card font-mono">
            Voice agent configuration not found.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
