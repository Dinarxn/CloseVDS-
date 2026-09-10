"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  CallStatusBadge,
  CallOutcomeBadge,
  CallTimeline,
  CallTranscriptViewer,
  CallOutcomeCard,
  CrmImpactCard,
  CallSafetyModal,
  CallDispatchModal,
  CallRejectModal,
} from "@/components/calling";
import { CallWithRelations } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCallDuration, formatCallDateTime } from "@/lib/mappers";
import { useToast } from "@/hooks/use-toast";

interface CallDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CallDetailPage({ params }: CallDetailPageProps) {
  const { id } = use(params);

  const [call, setCall] = useState<CallWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [providerConfigured, setProviderConfigured] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const { addToast } = useToast();

  const fetchCall = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [callRes, providersRes] = await Promise.allSettled([
        api.voice.getCall(id),
        api.settings.getProviders(),
      ]);

      if (callRes.status === "fulfilled" && callRes.value?.data) {
        setCall(callRes.value.data);
      } else {
        setErrorMsg("Call record not found or access denied.");
      }

      if (providersRes.status === "fulfilled" && providersRes.value?.providers) {
        const twilio = providersRes.value.providers.find((p) =>
          p.provider.toLowerCase().includes("twilio")
        );
        setProviderConfigured(Boolean(twilio?.isConfigured));
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load call details.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCall();
  }, [fetchCall]);

  const handleApprove = async () => {
    if (!call) return;
    setIsActionLoading(true);
    try {
      await api.voice.approveCall(call.id);
      addToast({
        title: "Call Approved",
        description: "Call approved for dispatch.",
        variant: "success",
      });
      fetchCall();
    } catch (err: unknown) {
      addToast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Approval failed",
        variant: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!call) return;
    setIsActionLoading(true);
    try {
      await api.voice.rejectCall(call.id, reason);
      addToast({
        title: "Call Rejected",
        description: "Call rejected and removed from dialling queue.",
        variant: "warning",
      });
      setIsRejectModalOpen(false);
      fetchCall();
    } catch (err: unknown) {
      addToast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : "Rejection failed",
        variant: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!call) return;
    setIsActionLoading(true);
    try {
      await api.voice.cancelCall(call.id, "Cancelled by operator via UI");
      addToast({
        title: "Call Cancelled",
        description: "Call session cancelled.",
        variant: "warning",
      });
      setIsCancelConfirmOpen(false);
      fetchCall();
    } catch (err: unknown) {
      addToast({
        title: "Cancellation Failed",
        description: err instanceof Error ? err.message : "Cancellation failed",
        variant: "error",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-400">Loading call intelligence and session data...</p>
        </div>
      </PageContainer>
    );
  }

  if (!call) {
    return (
      <PageContainer>
        <div className="py-12 text-center space-y-4">
          <p className="text-sm font-semibold text-white">Call not found</p>
          <Link href="/calling/calls">
            <Button variant="secondary" size="sm">
              &larr; Back to Call Queue
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isApprovalRequired = call.status === "APPROVAL_REQUIRED";
  const isApproved = call.status === "APPROVED";
  const isCancellable = ["QUEUED", "APPROVAL_REQUIRED", "APPROVED"].includes(call.status);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with status badges and primary actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title={call.lead?.businessName || `Call: ${call.id.substring(0, 8)}`}
            description={`Recalled session: ${call.normalizedPhone} • Objective: ${call.campaign?.targetOffer || "Acquisition Outreach"}`}
            breadcrumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "AI Calling", href: "/calling" },
              { label: "Call Queue", href: "/calling/calls" },
              { label: call.id.substring(0, 8) },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSafetyModalOpen(true)}
            >
              Verify Safety Gates
            </Button>

            {isApprovalRequired && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                  disabled={isActionLoading}
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium shadow-none"
                  disabled={isActionLoading}
                  onClick={handleApprove}
                >
                  Approve Call
                </Button>
              </>
            )}

            {isApproved && (
              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                onClick={() => setIsDispatchModalOpen(true)}
              >
                Dispatch Outbound Call
              </Button>
            )}

            {isCancellable && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
                disabled={isActionLoading}
                onClick={() => setIsCancelConfirmOpen(true)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
        )}

        {call.blockedReason && (
          <Alert variant="destructive" title="Safety System Rejection / Lock">
            {call.blockedReason}
          </Alert>
        )}

        {/* Primary Metadata & Telephony Identity Card */}
        <Card variant="standard">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Call Status</span>
                <CallStatusBadge status={call.status} size="sm" />
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Outcome</span>
                <CallOutcomeBadge outcome={call.outcome?.outcome} size="sm" />
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Contact Handset</span>
                <span className="font-mono font-medium text-white block">
                  {call.normalizedPhone}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {call.contact?.fullName || "Primary"}
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Duration</span>
                <span className="font-mono text-white block font-medium tabular-nums">
                  {formatCallDuration(call.durationSeconds)}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {call.attempts?.length || 0} Telephony {call.attempts?.length === 1 ? "Attempt" : "Attempts"}
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Voice Agent Persona</span>
                <span className="text-white block font-medium">
                  {call.agentConfig?.name || "Standard Closer"}
                </span>
                <span className="text-[10px] text-zinc-400 truncate block">
                  Obj: {call.agentConfig?.callObjective?.substring(0, 20) || "Default"}...
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Telephony Provider</span>
                <span className="font-mono uppercase text-white block font-semibold">
                  {call.providerName || "twilio"}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono truncate block">
                  {call.providerCallId ? `SID: ${call.providerCallId.substring(0, 10)}...` : "Not Dispatched"}
                </span>
              </div>
            </div>

            {/* Timestamps Bar */}
            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400">
              <div>
                <span>Created: </span>
                <span className="text-zinc-200 font-mono">{formatCallDateTime(call.createdAt)}</span>
              </div>
              <div>
                <span>Approved: </span>
                <span className="text-zinc-200 font-mono">{formatCallDateTime(call.approvedAt)}</span>
              </div>
              <div>
                <span>Initiated: </span>
                <span className="text-zinc-200 font-mono">{formatCallDateTime(call.initiatedAt)}</span>
              </div>
              <div>
                <span>Completed: </span>
                <span className="text-zinc-200 font-mono">{formatCallDateTime(call.completedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Intelligence & Deep Logs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="transcript">
          <TabList className="w-full">
            <Tab value="transcript">
              Transcript Turns ({call.transcripts?.length || 0})
            </Tab>
            <Tab value="timeline">
              Events Timeline ({call.events?.length || 0})
            </Tab>
            <Tab value="outcome">
              AI Outcome Analysis
            </Tab>
            <Tab value="crm">
              CRM &amp; Follow-Up Sync
            </Tab>
          </TabList>

          {/* 1. Transcript Turns */}
          <TabPanel value="transcript" className="pt-4">
            <Card variant="standard">
              <CardHeader>
                <CardTitle>Real-Time Speech Transcript</CardTitle>
                <CardDescription>
                  Verbatim turns streamed between the AI calling agent, prospect handset, and system guardrail monitors.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CallTranscriptViewer transcripts={call.transcripts} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* 2. Events Timeline */}
          <TabPanel value="timeline" className="pt-4">
            <Card variant="standard">
              <CardHeader>
                <CardTitle>Telephony &amp; Lifecycle Timeline</CardTitle>
                <CardDescription>
                  Cryptographically audited events recorded during call preparation, ringing, connection, and termination.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CallTimeline events={call.events} />
              </CardContent>
            </Card>
          </TabPanel>

          {/* 3. AI Outcome Analysis */}
          <TabPanel value="outcome" className="pt-4">
            <CallOutcomeCard outcome={call.outcome} />
          </TabPanel>

          {/* 4. CRM & Follow-Up Impact */}
          <TabPanel value="crm" className="pt-4">
            <CrmImpactCard call={call} />
          </TabPanel>
        </Tabs>

        {/* Modals */}
        <CallSafetyModal
          isOpen={isSafetyModalOpen}
          callId={call.id}
          onClose={() => setIsSafetyModalOpen(false)}
        />

        <CallDispatchModal
          isOpen={isDispatchModalOpen}
          call={call}
          providerConfigured={providerConfigured}
          onClose={() => setIsDispatchModalOpen(false)}
          onDispatched={() => {
            fetchCall();
          }}
        />

        <CallRejectModal
          isOpen={isRejectModalOpen}
          leadName={call.lead?.businessName}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={handleConfirmReject}
        />

        <ConfirmDialog
          open={isCancelConfirmOpen}
          onOpenChange={setIsCancelConfirmOpen}
          onConfirm={handleConfirmCancel}
          title="Cancel Call Session"
          description="Are you sure you want to cancel this call session? This will disqualify the call and prevent future dialling."
          confirmLabel="Yes, Cancel Call"
          cancelLabel="Keep Call"
          variant="destructive"
          isLoading={isActionLoading}
        />
      </div>
    </PageContainer>
  );
}
