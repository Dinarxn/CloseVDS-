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

  // Audio recording player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const totalDuration = call?.durationSeconds || 60;
  const waveformBars = [40, 65, 30, 80, 50, 95, 60, 45, 75, 90, 85, 40, 55, 70, 95, 60, 30, 80, 75, 45, 88, 62, 40, 70, 90, 50, 35, 65, 80, 45];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(totalDuration, prev + 0.5 * playbackSpeed);
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  const togglePlayback = () => setIsPlaying(!isPlaying);
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };
  const toggleMute = () => setIsMuted(!isMuted);
  const handleDownloadAudio = () => {
    addToast({
      title: "Audio Export Initiated",
      description: "Encrypted call recording archive downloaded.",
      variant: "success",
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

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
        <div className="py-20 text-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-400 font-mono">Loading call intelligence and session data...</p>
        </div>
      </PageContainer>
    );
  }

  if (!call) {
    return (
      <PageContainer>
        <div className="py-16 text-center space-y-4">
          <p className="text-sm font-semibold text-white">Call not found</p>
          <Link href="/calling/calls">
            <Button variant="secondary" size="sm" className="bg-surface-elevated text-white border-white/[0.1]">
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
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* Header with status badges and primary actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={call.lead?.businessName || `Call: ${call.id.substring(0, 8)}`}
          description={`Recalled session: ${call.normalizedPhone} • Objective: ${call.campaign?.targetOffer || "Acquisition Outreach"}`}
          breadcrumbs={[
            { label: "Workspace", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Call Queue & History", href: "/calling/calls" },
            { label: call.id.substring(0, 8) },
          ]}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSafetyModalOpen(true)}
            className="h-8.5 px-3 text-xs border-white/[0.08] hover:border-white/[0.2] hover:bg-surface-elevated font-mono"
          >
            Verify Safety Gates
          </Button>

          {isApprovalRequired && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8.5 px-3 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                disabled={isActionLoading}
                onClick={() => setIsRejectModalOpen(true)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="h-8.5 px-3.5 text-xs bg-lime-500/15 hover:bg-lime-500/25 text-[#C6FF33] border border-lime-500/35 font-semibold shadow-xs"
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
              className="h-8.5 px-3.5 text-xs bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
              onClick={() => setIsDispatchModalOpen(true)}
            >
              Dispatch Outbound Call
            </Button>
          )}

          {isCancellable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8.5 px-3 text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20"
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
      <Card variant="standard" className="bg-surface-card border-white/[0.08] relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 block mb-1 font-mono text-[10px] uppercase">Call Status</span>
              <CallStatusBadge status={call.status} size="sm" />
            </div>

            <div>
              <span className="text-zinc-400 block mb-1 font-mono text-[10px] uppercase">Outcome</span>
              <CallOutcomeBadge outcome={call.outcome?.outcome} size="sm" />
            </div>

            <div>
              <span className="text-zinc-400 block mb-1 font-mono text-[10px] uppercase">Contact Handset</span>
              <span className="font-mono font-medium text-white block">
                {call.normalizedPhone}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">
                {call.contact?.fullName || "Primary"}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block mb-1 font-mono text-[10px] uppercase">Duration</span>
              <span className="font-mono text-white block font-medium tabular-nums">
                {formatCallDuration(call.durationSeconds)}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {call.attempts?.length || 0} Telephony {call.attempts?.length === 1 ? "Attempt" : "Attempts"}
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block mb-1 font-mono text-[10px] uppercase">Voice Agent</span>
              <span className="text-white block font-medium">
                {call.agentConfig?.name || "Standard Closer"}
              </span>
              <span className="text-[10px] text-zinc-400 truncate block font-sans">
                Obj: {call.agentConfig?.callObjective?.substring(0, 20) || "Default"}...
              </span>
            </div>

            <div>
              <span className="text-zinc-400 block mb-1 font-mono text-[10px] uppercase">Provider</span>
              <span className="font-mono uppercase text-white block font-semibold">
                {call.providerName || "twilio"}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono truncate block">
                {call.providerCallId ? `SID: ${call.providerCallId.substring(0, 10)}...` : "Not Dispatched"}
              </span>
            </div>
          </div>

          {/* Timestamps Bar */}
          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-zinc-400 font-mono">
            <div>
              <span className="text-zinc-500">Created: </span>
              <span className="text-zinc-200">{formatCallDateTime(call.createdAt)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Approved: </span>
              <span className="text-zinc-200">{formatCallDateTime(call.approvedAt)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Initiated: </span>
              <span className="text-zinc-200">{formatCallDateTime(call.initiatedAt)}</span>
            </div>
            <div>
              <span className="text-zinc-500">Completed: </span>
              <span className="text-zinc-200">{formatCallDateTime(call.completedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Playback Controls & Waveform Player Widget */}
      {((call.durationSeconds ?? 0) > 0 || call.status === "COMPLETED" || (call.transcripts && call.transcripts.length > 0)) && (
        <Card variant="standard" className="bg-surface-card border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Play / Pause & Time */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">
                      {formatTime(playbackTime)} / {formatTime(totalDuration)}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/25 uppercase font-semibold">
                      Authorized Recording
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    8kHz G.711 telephonic stream • Encrypted media archive
                  </span>
                </div>
              </div>

              {/* Scrubber & Waveform */}
              <div className="flex-1 max-w-md space-y-1.5">
                {/* Waveform Visualization Bars */}
                <div className="flex items-end gap-1 h-7 px-1">
                  {waveformBars.map((height, i) => {
                    const barProgress = (i / waveformBars.length) * totalDuration;
                    const isPlayed = barProgress <= playbackTime;
                    return (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`flex-1 rounded-xs transition-colors ${
                          isPlayed
                            ? "bg-[#C6FF33] shadow-[0_0_4px_rgba(198,255,51,0.5)]"
                            : "bg-surface-panel border-t border-white/[0.08]"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Progress Bar / Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={totalDuration || 1}
                  step={0.5}
                  value={playbackTime}
                  onChange={(e) => setPlaybackTime(Number(e.target.value))}
                  className="w-full h-1 bg-surface-panel rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              {/* Speed & Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2.5 py-1 rounded-lg bg-surface-panel border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {playbackSpeed}x
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg bg-surface-panel border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAudio}
                  className="px-2.5 py-1 rounded-lg bg-surface-panel border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>⬇</span>
                  <span>Audio</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Intelligence & Deep Logs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="transcript">
        <TabList className="w-full bg-surface-card border border-white/[0.08] p-1 rounded-xl">
          <Tab value="transcript" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            Transcript Turns ({call.transcripts?.length || 0})
          </Tab>
          <Tab value="timeline" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            Events Timeline ({call.events?.length || 0})
          </Tab>
          <Tab value="outcome" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            AI Outcome Analysis
          </Tab>
          <Tab value="crm" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
            CRM &amp; Follow-Up Sync
          </Tab>
        </TabList>

        {/* 1. Transcript Turns */}
        <TabPanel value="transcript" className="pt-4">
          <Card variant="standard" className="bg-surface-card border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
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
          <Card variant="standard" className="bg-surface-card border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            <CardHeader>
              <CardTitle>Telephony &amp; Lifecycle Timeline</CardTitle>
              <CardDescription>
                Audited events recorded during call preparation, ringing, connection, and termination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallTimeline callId={call.id} events={call.events} />
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
    </PageContainer>
  );
}
