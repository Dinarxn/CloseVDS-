"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/lib/api-client";
import type { QueueItem, OperationTask, OperationsSummary } from "@/types/operations";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "call-ready">("queue");
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
          <div className="flex items-center gap-2.5">
            <Link href="/leads">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="text-xs flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* SECTION 2: Database Offline / Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 text-xs text-amber-200">
          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold block text-amber-300">Operations Status Notice</span>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* SECTION 3: Operational Readiness Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card variant="standard" className="p-4 bg-[#0e0e14] border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
            Active Call Queue
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {queueItems.length}
            </span>
            <span className="text-xs text-zinc-400">calls queued</span>
          </div>
        </Card>

        <Card variant="standard" className="p-4 bg-[#0e0e14] border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
            Call-Ready Prospects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {summary?.callReadyCount ?? callReadyTasks.length}
            </span>
            <span className="text-xs text-zinc-400">approved &amp; eligible</span>
          </div>
        </Card>

        <Card variant="standard" className="p-4 bg-[#0e0e14] border border-white/[0.08]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
            Outbound Readiness
          </span>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${summary?.systemHealth?.telephonyConfigured ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-xs text-zinc-300 font-mono">Telephony</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${summary?.systemHealth?.voiceAiConfigured ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-xs text-zinc-300 font-mono">Voice AI</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 4: View Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1">
        <button
          onClick={() => setActiveTab("queue")}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
            activeTab === "queue"
              ? "bg-white/[0.12] text-white border border-white/[0.14]"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <span>Active Call Queue</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === "queue" ? "bg-white/[0.2] text-white font-bold" : "bg-white/[0.06] text-zinc-400"
          }`}>
            {queueItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("call-ready")}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer ${
            activeTab === "call-ready"
              ? "bg-white/[0.12] text-white border border-white/[0.14]"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          <span>Call-Ready Prospects</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            activeTab === "call-ready" ? "bg-white/[0.2] text-white font-bold" : "bg-white/[0.06] text-zinc-400"
          }`}>
            {callReadyTasks.length}
          </span>
        </button>
      </div>

      {/* SECTION 5: Content Area */}
      {isLoading ? (
        <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#0f0f16] space-y-3">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-mono">Synchronizing operations queue...</p>
        </div>
      ) : activeTab === "queue" ? (
        /* TAB 1: Active Call Queue View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Queue Position &amp; Calling Status
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {queueItems.length} Enqueued Item{queueItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {queueItems.length === 0 ? (
            <Card variant="standard" className="p-10 text-center space-y-2.5">
              <div className="w-9 h-9 mx-auto rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-white">Call Queue is Empty</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                No active calls are queued. Approve eligible leads in the Lead Pool to prepare them for the call queue.
              </p>
              <div className="pt-2">
                <Link href="/leads">
                  <Button size="sm" variant="secondary" className="text-xs">
                    View Lead Pool
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {queueItems.map((item, index) => (
                <Card
                  key={item.id}
                  variant="interactive"
                  className="p-3.5 bg-[#0d0d14] border border-white/[0.08] hover:border-white/[0.16] rounded-xl transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold shrink-0">
                        #{item.priority || index + 1}
                      </span>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {item.businessName}
                          </h4>
                          <Badge
                            variant={item.isApproved ? "solid" : "secondary"}
                            size="sm"
                            className="text-[9px] font-mono"
                          >
                            {item.isApproved ? "Authorized" : "Pending"}
                          </Badge>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400">
                            {item.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                          <span className="font-mono">{item.recipientPhone}</span>
                          <span>•</span>
                          <span>Enqueued: {formatTime(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handlePrioritize(item.id, item.priority || index + 1)}
                        disabled={actionInProgress === item.id}
                        className="text-xs flex items-center gap-1 h-7 px-2.5"
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
                        className="text-xs text-rose-300 hover:text-rose-200 h-7 px-2.5"
                      >
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: Call-Ready Prospects View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Step 20 Approved Prospects (CALL_READY)
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {callReadyTasks.length} Prospect{callReadyTasks.length === 1 ? "" : "s"} Eligible
            </span>
          </div>

          {callReadyTasks.length === 0 ? (
            <Card variant="standard" className="p-10 text-center space-y-2.5">
              <div className="w-9 h-9 mx-auto rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-white">No Call-Ready Prospects</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Leads must be analyzed and approved via the Step 20 human approval workflow in the Lead Pool to become eligible for the calling queue.
              </p>
              <div className="pt-2">
                <Link href="/leads">
                  <Button size="sm" variant="secondary" className="text-xs">
                    Open Lead Pool
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {callReadyTasks.map((task) => (
                <Card
                  key={task.id}
                  variant="interactive"
                  className="p-3.5 bg-[#0d0d14] border border-white/[0.08] hover:border-white/[0.16] rounded-xl transition-all duration-150"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="solid" size="sm" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono">
                          CALL_READY
                        </Badge>
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
                        <Button size="sm" variant="secondary" className="text-xs flex items-center gap-1.5">
                          <span>Inspect Lead</span>
                          <span>→</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
