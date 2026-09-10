"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { VoiceAgentCard } from "@/components/calling";
import { VoiceAgentConfig } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";

export default function VoiceAgentsPage() {
  const [agents, setAgents] = useState<VoiceAgentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.voice.getAgentConfigs();
      if (res?.data) {
        setAgents(res.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load Voice Agent configurations.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="AI Voice Agents"
            description="Manage conversational personas, qualification criteria, approved talking points, and anti-hallucination rules."
            breadcrumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "AI Calling", href: "/calling" },
              { label: "Voice Agents" },
            ]}
          />

          <Link href="/calling/agents/new">
            <Button variant="primary" size="sm">
              + Create Voice Agent
            </Button>
          </Link>
        </div>

        <Alert variant="warning" title="Factual Grounding Guardrails Enforced">
          AI-generated content must remain grounded in verified lead data and approved acquisition intelligence. The calling agent will not invent facts, unverified capabilities, or unauthorized discounts.
        </Alert>

        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
        )}

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading voice agents from workspace...</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#0d0d12] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">No voice agents configured</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                Create your first AI voice agent persona with customized objectives, qualification questions, and prohibited claims.
              </p>
            </div>
            <Link href="/calling/agents/new">
              <Button variant="primary" size="sm">
                Create First Voice Agent
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <VoiceAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
