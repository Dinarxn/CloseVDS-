"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  ProviderStatusCard,
  N8nKeysManager,
  N8nDeliveriesTable,
  CallingPolicyCard,
} from "@/components/calling";
import {
  ProviderStatusItem,
  N8nIntegrationKey,
  N8nWebhookDelivery,
  WorkspaceCallingPolicy,
} from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";

export default function CallingSettingsPage() {
  const [policy, setPolicy] = useState<WorkspaceCallingPolicy | null>(null);
  const [providers, setProviders] = useState<ProviderStatusItem[]>([]);
  const [n8nKeys, setN8nKeys] = useState<N8nIntegrationKey[]>([]);
  const [deliveries, setDeliveries] = useState<N8nWebhookDelivery[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [policyRes, providersRes, keysRes, deliveriesRes] = await Promise.allSettled([
        api.voice.getPolicy(),
        api.settings.getProviders(),
        api.n8n.listKeys(),
        api.n8n.listDeliveries(),
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

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl">
        <PageHeader
          title="Telephony & n8n Gateway Settings"
          description="External voice providers status reporting, scoped n8n workflow credentials, and signed webhook deliveries audit."
          breadcrumbs={[
            { label: "closeVDS", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Settings & Gateway" },
          ]}
        />

        {errorMsg && (
          <div className="relative rounded-xl border border-rose-500/30 bg-[#140b0e] p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-rose-300">Service Communication Error</h4>
              <p className="text-xs text-rose-200/80 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* 1. Calling Policy & Automation Controls */}
        <section>
          <CallingPolicyCard
            policy={policy}
            isLoading={isLoading}
            onPolicyUpdated={fetchData}
          />
        </section>

        {/* 2. Telephony and AI Provider Status */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
              Infrastructure Telemetry
            </span>
            <span className="text-zinc-600 font-mono text-[10px]">•</span>
            <h3 className="text-xs font-semibold text-white">External Providers Link Status</h3>
          </div>
          <ProviderStatusCard
            providers={providers}
            n8nActiveKeysCount={n8nKeys.filter((k) => k.isActive).length}
            isLoading={isLoading}
          />
        </section>

        {/* 2. n8n Integration Credentials Manager */}
        <section>
          <N8nKeysManager
            keys={n8nKeys}
            isLoading={isLoading}
            onKeyCreated={fetchData}
            onKeyRevoked={fetchData}
          />
        </section>

        {/* 3. Outbound Webhook Deliveries Table */}
        <section>
          <N8nDeliveriesTable deliveries={deliveries} isLoading={isLoading} />
        </section>
      </div>
    </PageContainer>
  );
}
