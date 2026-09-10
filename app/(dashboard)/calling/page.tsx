"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  CallingKpiGrid,
  ApprovalQueueWidget,
  ProviderStatusCard,
  SafetyStatusCard,
  CallsTable,
  CallPreparationModal,
  CallSafetyModal,
  CallDispatchModal,
  CallRejectModal,
} from "@/components/calling";
import {
  CallWithRelations,
  VoiceAnalyticsData,
  ProviderStatusItem,
  N8nIntegrationKey,
} from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function CallingDashboardPage() {
  const [calls, setCalls] = useState<CallWithRelations[]>([]);
  const [analytics, setAnalytics] = useState<VoiceAnalyticsData | null>(null);
  const [providers, setProviders] = useState<ProviderStatusItem[]>([]);
  const [n8nKeys, setN8nKeys] = useState<N8nIntegrationKey[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [safetyModalCallId, setSafetyModalCallId] = useState<string | null>(null);
  const [dispatchModalCall, setDispatchModalCall] = useState<CallWithRelations | null>(null);
  const [rejectingCall, setRejectingCall] = useState<CallWithRelations | null>(null);

  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [callsRes, analyticsRes, providersRes, n8nRes] = await Promise.allSettled([
        api.voice.listCalls({ limit: 15 }),
        api.voice.getVoiceAnalytics(),
        api.settings.getProviders(),
        api.n8n.listKeys(),
      ]);

      if (callsRes.status === "fulfilled" && callsRes.value?.data) {
        setCalls(callsRes.value.data);
      }

      if (analyticsRes.status === "fulfilled" && analyticsRes.value?.voice) {
        setAnalytics(analyticsRes.value.voice);
      }

      if (providersRes.status === "fulfilled" && providersRes.value?.providers) {
        setProviders(providersRes.value.providers);
      }

      if (n8nRes.status === "fulfilled" && n8nRes.value?.data) {
        setN8nKeys(n8nRes.value.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load AI Calling dashboard data.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (call: CallWithRelations) => {
    try {
      await api.voice.approveCall(call.id);
      addToast({
        title: "Call Approved",
        description: `Call for ${call.lead?.businessName || call.normalizedPhone} approved for dispatch.`,
        variant: "success",
      });
      fetchData();
    } catch (err: unknown) {
      addToast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Approval failed",
        variant: "error",
      });
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!rejectingCall) return;
    try {
      await api.voice.rejectCall(rejectingCall.id, reason);
      addToast({
        title: "Call Rejected",
        description: "Call disqualified and removed from outbound queue.",
        variant: "warning",
      });
      setRejectingCall(null);
      fetchData();
    } catch (err: unknown) {
      addToast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : "Rejection failed",
        variant: "error",
      });
    }
  };

  // Derived subsets
  const pendingCalls = calls.filter((c) => c.status === "APPROVAL_REQUIRED");
  const queuedCount = calls.filter((c) => c.status === "QUEUED").length;
  const twilioConfigured = Boolean(
    providers.find((p) => p.provider.toLowerCase().includes("twilio"))?.isConfigured
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with primary actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="AI Calling Agent"
            description="Autonomous voice outreach supervision, human approval queue, and grounded context evaluation."
            breadcrumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "AI Calling" },
            ]}
          />

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/calling/calls">
              <Button variant="secondary" size="sm">
                Call Queue
              </Button>
            </Link>
            <Link href="/calling/agents">
              <Button variant="secondary" size="sm">
                Voice Agents
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPrepModalOpen(true)}
            >
              + Prepare AI Call
            </Button>
          </div>
        </div>

        {errorMsg && (
          <Alert variant="destructive" title="Service Error">
            {errorMsg}
          </Alert>
        )}

        {/* 10 Operational Calling KPIs */}
        <CallingKpiGrid
          analytics={analytics}
          queuedCount={queuedCount}
          approvalRequiredCount={pendingCalls.length}
          callsTodayCount={calls.length}
          isLoading={isLoading}
        />

        {/* Human Approval Queue */}
        <ApprovalQueueWidget
          pendingCalls={pendingCalls}
          isLoading={isLoading}
          onActionComplete={fetchData}
          onCheckSafety={(call) => setSafetyModalCallId(call.id)}
        />

        {/* Dual Status Cards: Providers & Safety Guardrails */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ProviderStatusCard
            providers={providers}
            n8nActiveKeysCount={n8nKeys.filter((k) => k.isActive).length}
            isLoading={isLoading}
          />
          <SafetyStatusCard
            killSwitchActive={false}
            humanApprovalRequired={true}
            suppressedPhoneCount={analytics?.optOutCount || 0}
            dailyCap={25}
            callingWindow="09:00 - 17:00"
            providerConfigured={twilioConfigured}
          />
        </div>

        {/* Recent Calls Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Voice Outreach Calls</h3>
            <Link
              href="/calling/calls"
              className="text-xs text-zinc-400 hover:text-white underline transition-colors"
            >
              View Full Call Queue &rarr;
            </Link>
          </div>

          <CallsTable
            calls={calls.slice(0, 8)}
            isLoading={isLoading}
            onApprove={handleApprove}
            onReject={(call) => setRejectingCall(call)}
            onCheckSafety={(call) => setSafetyModalCallId(call.id)}
            onDispatch={(call) => setDispatchModalCall(call)}
            onPrepareClick={() => setIsPrepModalOpen(true)}
          />
        </div>

        {/* Modals */}
        <CallPreparationModal
          isOpen={isPrepModalOpen}
          onClose={() => setIsPrepModalOpen(false)}
          onCallCreated={() => {
            fetchData();
          }}
        />

        <CallSafetyModal
          isOpen={Boolean(safetyModalCallId)}
          callId={safetyModalCallId || ""}
          onClose={() => setSafetyModalCallId(null)}
        />

        <CallDispatchModal
          isOpen={Boolean(dispatchModalCall)}
          call={dispatchModalCall}
          providerConfigured={twilioConfigured}
          onClose={() => setDispatchModalCall(null)}
          onDispatched={() => {
            fetchData();
          }}
        />

        <CallRejectModal
          isOpen={Boolean(rejectingCall)}
          leadName={rejectingCall?.lead?.businessName}
          onClose={() => setRejectingCall(null)}
          onConfirm={handleConfirmReject}
        />
      </div>
    </PageContainer>
  );
}
