"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  ProviderIntegrationCenter,
  N8nKeysManager,
  N8nDeliveriesTable,
  CallingPolicyCard,
  PhoneNumbersTable,
} from "@/components/calling";
import {
  ProviderStatusItem,
  N8nIntegrationKey,
  N8nWebhookDelivery,
  WorkspaceCallingPolicy,
  TelephonyPhoneNumber,
  VoiceAgentConfig,
} from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";

type SettingsTab = "telephony" | "providers" | "safety" | "n8n";

export default function CallingSettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const tabParam = searchParams.get("tab") as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    tabParam && ["telephony", "providers", "safety", "n8n"].includes(tabParam)
      ? tabParam
      : "telephony"
  );

  const [policy, setPolicy] = useState<WorkspaceCallingPolicy | null>(null);
  const [, setProviders] = useState<ProviderStatusItem[]>([]);
  const [n8nKeys, setN8nKeys] = useState<N8nIntegrationKey[]>([]);
  const [deliveries, setDeliveries] = useState<N8nWebhookDelivery[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<TelephonyPhoneNumber[]>([]);
  const [agents, setAgents] = useState<VoiceAgentConfig[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync tab with URL
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`/calling/settings?${params.toString()}`);
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [policyRes, providersRes, keysRes, deliveriesRes, numbersRes, agentsRes] = await Promise.allSettled([
        api.voice.getPolicy(),
        api.settings.getProviders(),
        api.n8n.listKeys(),
        api.n8n.listDeliveries(),
        api.voice.listPhoneNumbers(),
        api.voice.getAgentConfigs(),
      ]);

      if (policyRes.status === "fulfilled" && policyRes.value?.data) {
        setPolicy(policyRes.value.data);
      }

      if (providersRes.status === "fulfilled" && providersRes.value?.providers) {
        setProviders(providersRes.value.providers);
      }

      if (keysRes.status === "fulfilled" && keysRes.value?.data) {
        setN8nKeys(keysRes.value.data);
      }

      if (deliveriesRes.status === "fulfilled" && deliveriesRes.value?.data) {
        setDeliveries(deliveriesRes.value.data);
      }

      if (numbersRes.status === "fulfilled" && numbersRes.value?.data) {
        setPhoneNumbers(numbersRes.value.data);
      }

      if (agentsRes.status === "fulfilled" && agentsRes.value?.data) {
        setAgents(agentsRes.value.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load telephony and n8n settings.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tab definitions with dynamic counters
  const activeKeysCount = n8nKeys.filter((k) => k.isActive).length;
  const isSafetyActive = policy ? policy.isActive : true;

  const TABS: { id: SettingsTab; label: string; badge: string; badgeColor: string }[] = [
    {
      id: "telephony",
      label: "Telephony & Carrier Numbers",
      badge: `${phoneNumbers.length} Lines`,
      badgeColor: "bg-surface-elevated text-zinc-300 border-white/[0.08]",
    },
    {
      id: "providers",
      label: "Voice AI Providers",
      badge: "3 Engines",
      badgeColor: "bg-surface-elevated text-violet-300 border-violet-500/20",
    },
    {
      id: "safety",
      label: "Calling Safety & Policies",
      badge: isSafetyActive ? "Protected" : "Kill Switch Active",
      badgeColor: isSafetyActive
        ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/25"
        : "bg-rose-500/10 text-rose-300 border-rose-500/25",
    },
    {
      id: "n8n",
      label: "n8n Workflow Automation",
      badge: `${activeKeysCount} Active Keys`,
      badgeColor: activeKeysCount > 0
        ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/25"
        : "bg-surface-elevated text-zinc-400 border-white/[0.08]",
    },
  ];

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6 max-w-5xl">
        <PageHeader
          title="Calling Settings &amp; Integration Hub"
          description="Carrier line routing, multi-provider credentials vault, zero-bypass safety guardrails, and scoped n8n workflow credentials."
          breadcrumbs={[
            { label: "Workspace", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Settings & Integration Hub" },
          ]}
        />

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

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-card border border-white/[0.08] overflow-x-auto shadow-xs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 font-sans cursor-pointer ${
                  isActive
                    ? "bg-surface-elevated text-white border border-white/[0.12] shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-panel/60"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-[#C6FF33]" : "bg-transparent"
                  }`}
                />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Telephony & Phone Numbers */}
        {activeTab === "telephony" && (
          <div className="space-y-4">
            <PhoneNumbersTable
              numbers={phoneNumbers}
              agents={agents}
              isLoading={isLoading}
              onRefresh={fetchData}
            />
          </div>
        )}

        {/* Tab 2: Voice AI Providers */}
        {activeTab === "providers" && (
          <div className="space-y-4">
            <ProviderIntegrationCenter onRefresh={fetchData} />
          </div>
        )}

        {/* Tab 3: Calling Safety & Policies */}
        {activeTab === "safety" && (
          <div className="space-y-4">
            <CallingPolicyCard
              policy={policy}
              isLoading={isLoading}
              onPolicyUpdated={fetchData}
            />
          </div>
        )}

        {/* Tab 4: n8n Workflow Automation Hub */}
        {activeTab === "n8n" && (
          <div className="space-y-6">
            <N8nKeysManager
              keys={n8nKeys}
              isLoading={isLoading}
              onKeyCreated={fetchData}
              onKeyRevoked={fetchData}
            />

            <N8nDeliveriesTable
              deliveries={deliveries}
              isLoading={isLoading}
              onRefresh={fetchData}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}
