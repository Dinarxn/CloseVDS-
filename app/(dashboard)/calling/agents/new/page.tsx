"use client";

import React from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { VoiceAgentStudioWizard } from "@/components/calling";

export default function CreateVoiceAgentPage() {
  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6 max-w-5xl">
        <PageHeader
          title="Voice Agent Studio"
          description="Design, test, and deploy AI voice agents with guided 11-step configuration, factual boundaries, and strict activation readiness gating."
          breadcrumbs={[
            { label: "Workspace", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Voice Agents", href: "/calling/agents" },
            { label: "Studio Wizard" },
          ]}
        />

        <VoiceAgentStudioWizard />
      </div>
    </PageContainer>
  );
}
