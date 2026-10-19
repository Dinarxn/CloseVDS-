"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/lib/api-client";
import { FollowUpWorkspace } from "@/components/operations";
import type { QueueItem, OperationTask, OperationsSummary } from "@/types/operations";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<"followups" | "queue" | "call-ready">("followups");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [callReadyTasks, setCallReadyTasks] = useState<OperationTask[]>([]);
  const [summary, setSummary] = useState<OperationsSummary | null>(null);

  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadOperationsData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [queueRes, callReadyRes, summaryRes] = await Promise.allSettled([
        api.operations.getQueue(),
        api.operations.getCallReady(),
        api.operations.getSummary(),
      ]);

      if (queueRes.status === "fulfilled" && queueRes.value?.data) {
        setQueueItems(queueRes.value.data);
      } else if (queueRes.status === "rejected") {
        const err = queueRes.reason;
        if (err instanceof ApiClientError && (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE")) {
          setErrorMessage("Cannot reach database server. PostgreSQL connection offline.");
        }
      }

      if (callReadyRes.status === "fulfilled" && callReadyRes.value?.data) {
        setCallReadyTasks(callReadyRes.value.data);
      }

      if (summaryRes.status === "fulfilled" && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      }
    } catch {
      setErrorMessage("Failed to synchronize operations queue.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperationsData();
  }, [loadOperationsData]);

  const handlePrioritize = async (itemId: string, currentPriority: number) => {
    setActionInProgress(itemId);
    try {
      await api.operations.prioritizeQueueItem(itemId, currentPriority + 1);
      await loadOperationsData();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to reprioritize queue item.");
      }
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancelCall = async (itemId: string) => {
    if (!window.confirm("Cancel this call from the outbound queue?")) return;
    setActionInProgress(itemId);
    try {
      await api.operations.cancelQueueItem(itemId, "Cancelled by operator via Operations dashboard");
      await loadOperationsData();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to cancel queued call.");
      }
    } finally {
      setActionInProgress(null);
    }
  };

  function formatTime(val?: string | Date) {
    if (!val) return "—";
    try {
      const d = new Date(val);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + d.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch {
      return "—";
    }
  }

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* SECTION 1: Page Header */}
      <PageHeader
        title="Operations &amp; Call Queue"
        description="Supervise approved and eligible prospects in the call queue, monitor operational readiness, and manage queue priority."
        breadcrumbs={[
          { label: "closeVDS", href: "/dashboard" },
          { label: "Operations" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 text-xs bg-[#101017] hover:bg-[#161622] text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Lead Pool</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={loadOperationsData}
              disabled={isLoading}
              className="h-8 px-3 text-xs bg-[#0b0b10] hover:bg-[#12121a] text-zinc-300 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* SECTION 2: Database Offline / Error Notice */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#140f09] border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90 shadow-xs">
          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-0.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-medium block">
              Operations Notice
            </span>
            <p className="text-amber-200/80 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* SECTION 3: Operational Readiness Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Card 1: Follow-ups Due */}
        <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.12] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
              Follow-Ups Due
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${(summary?.followUpsDueCount ?? 0) > 0 ? "bg-amber-400" : "bg-zinc-600"}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
              {summary?.followUpsDueCount ?? 0}
            </span>
            <span className="text-[11px] text-zinc-400">due in CRM</span>
          </div>
        </div>

        {/* Card 2: Active Call Queue */}
        <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.12] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
              Active Call Queue
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tracking-tight">
              {queueItems.length}
            </span>
            <span className="text-[11px] text-zinc-400">calls queued</span>
          </div>
        </div>

        {/* Card 3: Call-Ready Prospects */}
        <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.12] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
              Call-Ready
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${(summary?.callReadyCount ?? callReadyTasks.length) > 0 ? "bg-emerald-400" : "bg-zinc-600"}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
              {summary?.callReadyCount ?? callReadyTasks.length}
            </span>
            <span className="text-[11px] text-zinc-400">approved</span>
          </div>
        </div>

        {/* Card 4: Outbound Readiness */}
        <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.12] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
              Readiness
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${(summary?.systemHealth?.telephonyConfigured && summary?.systemHealth?.voiceAiConfigured) ? "bg-emerald-400" : "bg-amber-400"}`} />
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">
              <span className={`w-1 h-1 rounded-full shrink-0 ${summary?.systemHealth?.telephonyConfigured ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-[10px] text-zinc-300 font-mono font-medium">Tel</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.05]">
              <span className={`w-1 h-1 rounded-full shrink-0 ${summary?.systemHealth?.voiceAiConfigured ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-[10px] text-zinc-300 font-mono font-medium">Voice</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: View Tabs */}
      <div className="p-1 rounded-xl bg-[#0a0a10] border border-white/[0.07] inline-flex items-center gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("followups")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
            activeTab === "followups"
              ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-xs"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <span>Follow-Up Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
            activeTab === "queue"
              ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-xs"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <span>Active Call Queue</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
            activeTab === "queue" ? "bg-white/[0.14] text-white font-semibold" : "bg-white/[0.04] text-zinc-500"
          }`}>
            {queueItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("call-ready")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
            activeTab === "call-ready"
              ? "bg-white/[0.09] text-white border border-white/[0.12] shadow-xs"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <span>Call-Ready Prospects</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
            activeTab === "call-ready" ? "bg-white/[0.14] text-white font-semibold" : "bg-white/[0.04] text-zinc-500"
          }`}>
            {callReadyTasks.length}
          </span>
        </button>
      </div>

      {/* SECTION 5: Content Area */}
      {isLoading ? (
        <div className="p-12 text-center border border-white/[0.07] rounded-xl bg-[#0a0a10]/80 space-y-3">
          <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">Synchronizing operations queue...</p>
        </div>
      ) : activeTab === "followups" ? (
        /* TAB 0: Follow-Up Workspace */
        <FollowUpWorkspace onTaskChange={loadOperationsData} />
      ) : activeTab === "queue" ? (
        /* TAB 1: Active Call Queue View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${queueItems.length > 0 ? "bg-emerald-400" : "bg-zinc-600"}`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-medium">
                Queue Position &amp; Calling Status
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
              {queueItems.length} Enqueued Item{queueItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {queueItems.length === 0 ? (
            <div className="relative overflow-hidden rounded-xl bg-[#09090f]/90 border border-white/[0.08] p-8 sm:p-12 text-center space-y-3.5 shadow-xs">
              {/* Hairline reflection */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

              <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium block">
                  Call Queue
                </span>
                <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">Call Queue is Empty</h4>
              </div>

              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                No active calls are queued. Approve eligible leads in the Lead Pool to prepare them for the call queue.
              </p>

              <div className="pt-2">
                <Link href="/leads">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs h-8 px-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-white border-white/[0.1] hover:border-white/[0.2] shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>View Lead Pool</span>
                    <span className="text-zinc-400">→</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {queueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#0b0b10] border border-white/[0.07] hover:border-white/[0.14] rounded-xl transition-all duration-150 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300 font-semibold shrink-0">
                        #{item.priority || index + 1}
                      </span>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.businessName}
                          </h4>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-medium uppercase ${
                            item.isApproved
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {item.isApproved ? "Authorized" : "Pending"}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-400">
                            {item.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-zinc-400">
                          <span className="font-mono text-zinc-300">{item.recipientPhone}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-500">Enqueued: {formatTime(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePrioritize(item.id, item.priority || index + 1)}
                        disabled={actionInProgress === item.id}
                        className="text-xs flex items-center gap-1 h-7.5 px-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border-white/[0.08] shadow-xs"
                      >
                        <svg className="w-3 h-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                        <span>Prioritize</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelCall(item.id)}
                        disabled={actionInProgress === item.id}
                        className="text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border-rose-500/20 h-7.5 px-2.5"
                      >
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: Call-Ready Prospects View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${callReadyTasks.length > 0 ? "bg-emerald-400" : "bg-zinc-600"}`} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-medium">
                Step 20 Approved Prospects (CALL_READY)
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.06]">
              {callReadyTasks.length} Prospect{callReadyTasks.length === 1 ? "" : "s"} Eligible
            </span>
          </div>

          {callReadyTasks.length === 0 ? (
            <div className="relative overflow-hidden rounded-xl bg-[#09090f]/90 border border-white/[0.08] p-8 sm:p-12 text-center space-y-3.5 shadow-xs">
              {/* Hairline reflection */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

              <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium block">
                  Lead Pool Readiness
                </span>
                <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">No Call-Ready Prospects</h4>
              </div>

              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Leads must be analyzed and approved via the Step 20 human approval workflow in the Lead Pool to become eligible for the calling queue.
              </p>

              <div className="pt-2">
                <Link href="/leads">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs h-8 px-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-white border-white/[0.1] hover:border-white/[0.2] shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>Open Lead Pool</span>
                    <span className="text-zinc-400">→</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {callReadyTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 bg-[#0b0b10] border border-white/[0.07] hover:border-white/[0.14] rounded-xl transition-all duration-150 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                          CALL_READY
                        </span>
                        <h4 className="text-xs font-semibold text-white truncate">
                          {task.target}
                        </h4>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {task.reason}
                      </p>

                      <div className="text-[11px] text-zinc-500 font-mono">
                        Ready since: {formatTime(task.timestamp)}
                      </div>
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      <Link href="/leads">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs h-7.5 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border-white/[0.08] flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Inspect Lead</span>
                          <span className="text-zinc-400">→</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
