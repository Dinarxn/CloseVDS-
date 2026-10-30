"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RefreshIcon, BuildingIcon, AlertCircleIcon } from "@/components/ui/icons";
import { api, ApiClientError } from "@/lib/api-client";
import {
  FollowUpWorkspace,
  OperationsTelemetry,
  ActiveCallQueue,
  CallReadyProspects,
} from "@/components/operations";
import type { QueueItem, OperationTask, OperationsSummary } from "@/types/operations";

type ActiveTab = "followups" | "queue" | "call-ready";

export default function OperationsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("followups");
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
      setErrorMessage("Failed to synchronize operations workspace data.");
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
    setActionInProgress(itemId);
    try {
      await api.operations.cancelQueueItem(
        itemId,
        "Cancelled by operator via Operations dashboard"
      );
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

  return (
    <PageContainer maxWidth="xl">
      <div className="space-y-6">
        {/* 1. Page Header */}
        <PageHeader
          title="Operations &amp; Call Queue"
          description="Execute scheduled follow-ups, review call-ready prospects, and manage outbound execution queues."
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
                  className="gap-1.5"
                >
                  <BuildingIcon size={14} className="text-zinc-400" />
                  <span>Lead Pool</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={loadOperationsData}
                disabled={isLoading}
                className="gap-1.5"
              >
                <RefreshIcon
                  size={14}
                  className={`text-zinc-400 ${isLoading ? "animate-spin text-[#7D39EB]" : ""}`}
                />
                <span>Refresh</span>
              </Button>
            </div>
          }
        />

        {/* 2. Operations / Database Notice */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200 shadow-xs relative overflow-hidden">
            <AlertCircleIcon size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-semibold block">
                Operations Notice
              </span>
              <p className="text-amber-200/80 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 3. Operational Telemetry Metrics */}
        <OperationsTelemetry
          summary={summary}
          queueCount={queueItems.length}
          callReadyCount={summary?.callReadyCount ?? callReadyTasks.length}
        />

        {/* 4. Workspace View Tabs */}
        <div className="p-1 rounded-xl bg-surface-panel border border-white/[0.08] inline-flex items-center gap-1 shadow-xs">
          {/* Tab 1: Follow-up Tasks */}
          <button
            type="button"
            onClick={() => setActiveTab("followups")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D39EB] ${
              activeTab === "followups"
                ? "bg-[#7D39EB]/20 text-white border border-[#7D39EB]/40 font-semibold shadow-xs"
                : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
            }`}
          >
            <span>Follow-Up Tasks</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded tabular-nums ${
                activeTab === "followups"
                  ? "bg-[#7D39EB]/30 text-white font-semibold"
                  : "bg-white/[0.05] text-zinc-400"
              }`}
            >
              {summary?.followUpsDueCount ?? 0}
            </span>
          </button>

          {/* Tab 2: Active Call Queue */}
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D39EB] ${
              activeTab === "queue"
                ? "bg-[#7D39EB]/20 text-white border border-[#7D39EB]/40 font-semibold shadow-xs"
                : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
            }`}
          >
            <span>Active Call Queue</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded tabular-nums ${
                activeTab === "queue"
                  ? "bg-[#7D39EB]/30 text-white font-semibold"
                  : "bg-white/[0.05] text-zinc-400"
              }`}
            >
              {queueItems.length}
            </span>
          </button>

          {/* Tab 3: Call-Ready Prospects */}
          <button
            type="button"
            onClick={() => setActiveTab("call-ready")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D39EB] ${
              activeTab === "call-ready"
                ? "bg-[#7D39EB]/20 text-white border border-[#7D39EB]/40 font-semibold shadow-xs"
                : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
            }`}
          >
            <span>Call-Ready Prospects</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded tabular-nums ${
                activeTab === "call-ready"
                  ? "bg-[#7D39EB]/30 text-white font-semibold"
                  : "bg-white/[0.05] text-zinc-400"
              }`}
            >
              {callReadyTasks.length}
            </span>
          </button>
        </div>

        {/* 5. Active Tab Workspace Content */}
        {activeTab === "followups" && (
          <FollowUpWorkspace onTaskChange={loadOperationsData} />
        )}

        {activeTab === "queue" && (
          <ActiveCallQueue
            queueItems={queueItems}
            isLoading={isLoading}
            actionInProgressId={actionInProgress}
            onPrioritize={handlePrioritize}
            onCancelCall={handleCancelCall}
            onQueueUpdated={loadOperationsData}
          />
        )}

        {activeTab === "call-ready" && (
          <CallReadyProspects
            tasks={callReadyTasks}
            isLoading={isLoading}
            onRefresh={loadOperationsData}
          />
        )}
      </div>
    </PageContainer>
  );
}
