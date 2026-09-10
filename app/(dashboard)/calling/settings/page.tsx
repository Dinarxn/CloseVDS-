"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import {
  ProviderStatusCard,
  N8nKeysManager,
  N8nDeliveriesTable,
} from "@/components/calling";
import {
  ProviderStatusItem,
  N8nIntegrationKey,
  N8nWebhookDelivery,
} from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";

export default function CallingSettingsPage() {
  const [providers, setProviders] = useState<ProviderStatusItem[]>([]);
  const [n8nKeys, setN8nKeys] = useState<N8nIntegrationKey[]>([]);
  const [deliveries, setDeliveries] = useState<N8nWebhookDelivery[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [providersRes, keysRes, deliveriesRes] = await Promise.allSettled([
        api.settings.getProviders(),
        api.n8n.listKeys(),
        api.n8n.listDeliveries(),
      ]);

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
      <div className="space-y-8 max-w-5xl">
        <PageHeader
          title="Telephony &amp; n8n Gateway Settings"
          description="External voice providers status reporting, scoped n8n workflow credentials, and signed webhook deliveries audit."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Settings & Gateway" },
          ]}
        />

        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
        )}

        {/* 1. Telephony and AI Provider Status */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-white">External Providers Link Status</h3>
          <ProviderStatusCard
            providers={providers}
            n8nActiveKeysCount={n8nKeys.filter((k) => k.isActive).length}
            isLoading={isLoading}
          />
        </section>

        {/* 2. n8n Integration Credentials Manager */}
        <section className="space-y-2">
          <N8nKeysManager
            keys={n8nKeys}
            isLoading={isLoading}
            onKeyCreated={fetchData}
            onKeyRevoked={fetchData}
          />
        </section>

        {/* 3. Outbound Webhook Deliveries Table */}
        <section className="space-y-2">
          <N8nDeliveriesTable deliveries={deliveries} isLoading={isLoading} />
        </section>
      </div>
    </PageContainer>
  );
}
