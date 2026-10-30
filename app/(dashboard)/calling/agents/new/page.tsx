"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { VoiceAgentForm } from "@/components/calling";
import { CreateVoiceAgentConfigInput } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function CreateVoiceAgentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleSubmit = async (data: CreateVoiceAgentConfigInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.voice.createAgentConfig(data);
      addToast({
        title: "Voice Agent Created",
        description: `Agent ${data.name} configured successfully.`,
        variant: "success",
      });
      router.push("/calling/agents");
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to create voice agent configuration.";
      setErrorMsg(msg);
      addToast({
        title: "Creation Failed",
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
          title="Create Voice Agent"
          description="Define conversation parameters, qualification criteria, approved talking points, and anti-hallucination guardrails."
          breadcrumbs={[
            { label: "Workspace", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Voice Agents", href: "/calling/agents" },
            { label: "New Agent" },
          ]}
        />

        {errorMsg && (
          <Alert variant="destructive" title="Creation Error">
            {errorMsg}
          </Alert>
        )}

        <VoiceAgentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </PageContainer>
  );
}
