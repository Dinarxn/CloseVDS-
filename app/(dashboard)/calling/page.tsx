"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  CallingKpiGrid,
  ApprovalQueueWidget,
  ProviderIntegrationCenter,
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
  WorkspaceCallingPolicy,
} from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function CallingDashboardPage() {
  const [calls, setCalls] = useState<CallWithRelations[]>([]);
  const [analytics, setAnalytics] = useState<VoiceAnalyticsData | null>(null);
  const [policy, setPolicy] = useState<WorkspaceCallingPolicy | null>(null);
  const [telephonyConfigured, setTelephonyConfigured] = useState(false);

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
      const [callsRes, analyticsRes, policyRes, telephonyRes] = await Promise.allSettled([
        api.voice.listCalls({ limit: 15 }),
        api.voice.getVoiceAnalytics(),
        api.voice.getPolicy(),
        api.voice.getTelephonySettings(),
      ]);

      if (callsRes.status === "fulfilled" && callsRes.value?.data) {
        setCalls(callsRes.value.data);
      }

      if (analyticsRes.status === "fulfilled" && analyticsRes.value?.voice) {
        setAnalytics(analyticsRes.value.voice);
      }

      if (policyRes.status === "fulfilled" && policyRes.value?.data) {
        setPolicy(policyRes.value.data);
      }

      if (telephonyRes.status === "fulfilled" && telephonyRes.value?.data) {
        setTelephonyConfigured(Boolean(telephonyRes.value.data.isConfigured));
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

  const handleCancel = async (call: CallWithRelations) => {
    try {
      await api.voice.cancelCall(call.id, "Cancelled by operator via Dashboard");
      addToast({
        title: "Call Cancelled",
        description: `Call for ${call.lead?.businessName || call.normalizedPhone} cancelled.`,
        variant: "warning",
      });
      fetchData();
    } catch (err: unknown) {
      addToast({
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "Cancellation failed",
        variant: "error",
      });
    }
  };

  // Derived subsets
  const pendingCalls = calls.filter((c) => c.status === "APPROVAL_REQUIRED");
  const queuedCount = calls.filter((c) => c.status === "QUEUED").length;

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* Header with command center action hierarchy */}
      <PageHeader
        title="AI Calling Agent"
        description="Autonomous voice outreach supervision, human approval queue, and multi-provider voice telemetry."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "AI Calling Overview" },
        ]}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/calling/calls">
              <Button
                variant="secondary"
                size="sm"
                className="h-8.5 px-3 text-xs bg-surface-card hover:bg-surface-elevated text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call History</span>
              </Button>
            </Link>
            <Link href="/calling/agents">
              <Button
                variant="secondary"
                size="sm"
                className="h-8.5 px-3 text-xs bg-surface-card hover:bg-surface-elevated text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Voice Agents</span>
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPrepModalOpen(true)}
              className="h-8.5 px-3.5 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] animate-pulse" />
              <span>+ Prepare AI Call</span>
            </Button>
          </div>
        }
      />

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#140f09] border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90 shadow-xs">
          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-0.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-medium block">
              Calling System Notice
            </span>
            <p className="text-amber-200/80 leading-relaxed font-sans">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Quick Action Launcher Bar (Obsidian Desktop Palette) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setIsPrepModalOpen(true)}
          className="p-3.5 rounded-xl bg-surface-card border border-violet-500/30 hover:border-violet-500/60 hover:bg-violet-950/20 text-left transition-all group shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-semibold">
              Action 01
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] animate-pulse" />
          </div>
          <div className="text-xs font-semibold text-white group-hover:text-violet-200 transition-colors">
            Start / Prepare Call
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">
            Validate lead, policy, and DNC gates
          </p>
        </button>

        <Link
          href="/calling/agents/new"
          className="p-3.5 rounded-xl bg-surface-card border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-elevated text-left transition-all group shadow-xs block"
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Action 02
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D39EB]" />
          </div>
          <div className="text-xs font-semibold text-white group-hover:text-violet-200 transition-colors">
            Agent Studio Wizard
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">
            Build 11-step persona &amp; voices
          </p>
        </Link>

        <Link
          href="/calling/settings?tab=safety"
          className="p-3.5 rounded-xl bg-surface-card border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-elevated text-left transition-all group shadow-xs block"
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Action 03
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
          </div>
          <div className="text-xs font-semibold text-white group-hover:text-violet-200 transition-colors">
            Safety Controls &amp; Caps
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">
            Hours, DNC, and Kill Switch
          </p>
        </Link>

        <Link
          href="/calling/settings?tab=telephony"
          className="p-3.5 rounded-xl bg-surface-card border border-white/[0.08] hover:border-white/[0.16] hover:bg-surface-elevated text-left transition-all group shadow-xs block"
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Action 04
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
          <div className="text-xs font-semibold text-white group-hover:text-violet-200 transition-colors">
            Carrier Phone Numbers
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">
            Import lines &amp; agent routing
          </p>
        </Link>
      </div>

      {/* Operational Calling KPIs */}
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

      {/* Provider Integration Center (Twilio, Retell, Vapi) */}
      <ProviderIntegrationCenter onRefresh={fetchData} />

      {/* Safety Guardrails Overview */}
      <div className="grid grid-cols-1 gap-4">
        <SafetyStatusCard
          killSwitchActive={policy ? !policy.isActive : false}
          humanApprovalRequired={policy ? policy.humanApprovalRequired : true}
          suppressedPhoneCount={analytics?.optOutCount || 0}
          dailyCap={policy ? policy.dailyCallLimit : 25}
          callingWindow={policy ? `${policy.callingWindowStart} - ${policy.callingWindowEnd}` : "09:00 - 17:00"}
          providerConfigured={telephonyConfigured}
        />
      </div>

      {/* Recent Calls Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
            <h3 className="text-sm font-semibold text-white tracking-tight">Recent Voice Outreach Calls</h3>
          </div>
          <Link
            href="/calling/calls"
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 font-mono"
          >
            <span>View Full Call Queue &amp; History</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <CallsTable
          calls={calls.slice(0, 8)}
          isLoading={isLoading}
          onApprove={handleApprove}
          onReject={(call) => setRejectingCall(call)}
          onCancel={handleCancel}
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
        providerConfigured={telephonyConfigured}
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
    </PageContainer>
  );
}
