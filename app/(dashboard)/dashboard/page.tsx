"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { api } from "@/lib/api-client";
import { AcquisitionHealthStrip } from "@/components/dashboard/acquisition-health-strip";
import { LeadDiscoveryCard, type PreviewLead } from "@/components/dashboard/lead-discovery-card";
import { PipelineIntelligence, type PipelineStageCounts } from "@/components/dashboard/pipeline-intelligence";
import { CallingReadiness } from "@/components/dashboard/calling-readiness";
import { ActionRequired } from "@/components/dashboard/action-required";
import { RecentActivity, type ActivityItem } from "@/components/dashboard/recent-activity";
import { SafetyGovernance } from "@/components/dashboard/safety-governance";

interface LeadItem {
  id: string;
  businessName: string;
  domain?: string;
  city?: string;
  country?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  leadScore?: { finalScore?: number } | null;
}

interface CallItem {
  id: string;
  leadId: string;
  status: string;
  createdAt: string;
  lead?: { businessName?: string } | null;
  outcome?: { outcomeType?: string } | null;
}

interface LeadsApiResponse {
  items?: LeadItem[];
  data?: {
    items?: LeadItem[];
  };
}

interface CallsApiResponse {
  calls?: CallItem[];
  data?: {
    calls?: CallItem[];
  };
}

interface OverviewApiResponse {
  success?: boolean;
  metrics?: {
    leads?: {
      total: number;
      byStatus: Record<string, number>;
      qualificationRate: number;
      replyRate: number;
    };
    crm?: {
      totalActivities: number;
      byType: Record<string, number>;
    };
  };
}

export default function DashboardOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [qualifiedLeads, setQualifiedLeads] = useState<number | null>(null);
  const [qualificationRate, setQualificationRate] = useState<number | null>(null);
  const [unqualifiedLeadsCount, setUnqualifiedLeadsCount] = useState<number>(0);

  const [readyToCallCount, setReadyToCallCount] = useState<number | null>(null);
  const [callsTodayCount, setCallsTodayCount] = useState<number | null>(null);
  const [approvalRequiredCount, setApprovalRequiredCount] = useState<number | null>(null);
  const [meetingsCount, setMeetingsCount] = useState<number | null>(null);

  const [configuredProvidersCount, setConfiguredProvidersCount] = useState<number>(0);
  const [hasAgentConfig, setHasAgentConfig] = useState<boolean>(false);

  const [recentLeads, setRecentLeads] = useState<PreviewLead[]>([]);

  const [stageCounts, setStageCounts] = useState<PipelineStageCounts>({
    DISCOVERED: 0,
    RESEARCHED: 0,
    QUALIFIED: 0,
    CALL_READY: 0,
    CONTACTED: 0,
    INTERESTED: 0,
    MEETING: 0,
    WON: 0,
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [overviewRes, leadsRes, callsRes, providersRes, agentConfigsRes] =
        await Promise.allSettled([
          api.get<OverviewApiResponse>("/analytics/overview"),
          api.get<LeadsApiResponse>("/leads?limit=50"),
          api.voice.listCalls({ limit: 50 }),
          api.settings.getProviders(),
          api.voice.getAgentConfigs(),
        ]);

      // 1. Process Overview / Leads Stats
      let leadsTotal = 0;
      let qualCount = 0;
      let qualRate = 0;
      let newCount = 0;

      if (overviewRes.status === "fulfilled" && overviewRes.value?.metrics?.leads) {
        const leadMetrics = overviewRes.value.metrics.leads;
        leadsTotal = leadMetrics.total || 0;
        qualRate = leadMetrics.qualificationRate || 0;
        const byStatus = leadMetrics.byStatus || {};
        qualCount = (byStatus.QUALIFIED || 0) + (byStatus.CONTACTED || 0) + (byStatus.REPLIED || 0);
        newCount = byStatus.NEW || 0;
      }

      // 2. Process Raw Leads (if overview had 0 or as fallback)
      let rawLeads: LeadItem[] = [];
      if (leadsRes.status === "fulfilled") {
        const val = leadsRes.value as LeadsApiResponse;
        rawLeads = Array.isArray(val?.items) ? val.items : Array.isArray(val?.data?.items) ? val.data.items : [];
        if (leadsTotal === 0 && rawLeads.length > 0) {
          leadsTotal = rawLeads.length;
          qualCount = rawLeads.filter((l) => l.status === "QUALIFIED" || l.status === "CONTACTED").length;
          qualRate = Math.round((qualCount / leadsTotal) * 100);
          newCount = rawLeads.filter((l) => l.status === "NEW").length;
        }
      }

      setTotalLeads(leadsTotal);
      setQualifiedLeads(qualCount);
      setQualificationRate(qualRate);
      setUnqualifiedLeadsCount(newCount);
      setRecentLeads(rawLeads);

      // 3. Process Voice Calls Data
      let rawCalls: CallItem[] = [];
      let pendingApprovals = 0;
      let readyToCall = 0;
      let completedToday = 0;
      let meetings = 0;

      if (callsRes.status === "fulfilled") {
        const val = callsRes.value as CallsApiResponse;
        rawCalls = Array.isArray(val?.calls) ? val.calls : Array.isArray(val?.data?.calls) ? val.data.calls : [];

        const todayDateString = new Date().toISOString().split("T")[0];

        rawCalls.forEach((call) => {
          if (call.status === "APPROVAL_REQUIRED") {
            pendingApprovals++;
          }
          if (call.status === "QUEUED" || call.status === "INITIATING" || call.status === "APPROVED") {
            readyToCall++;
          }
          if (call.createdAt && call.createdAt.startsWith(todayDateString)) {
            completedToday++;
          }
          if (call.outcome?.outcomeType === "MEETING_REQUESTED") {
            meetings++;
          }
        });
      }

      setApprovalRequiredCount(pendingApprovals);
      setReadyToCallCount(readyToCall);
      setCallsTodayCount(completedToday);
      setMeetingsCount(meetings);

      // 4. Process Providers & Agent Configs
      if (providersRes.status === "fulfilled" && providersRes.value?.providers) {
        const configured = providersRes.value.providers.filter((p) => p.isConfigured).length;
        setConfiguredProvidersCount(configured);
      } else {
        setConfiguredProvidersCount(0);
      }

      if (agentConfigsRes.status === "fulfilled" && agentConfigsRes.value?.data) {
        setHasAgentConfig(agentConfigsRes.value.data.length > 0);
      } else {
        setHasAgentConfig(false);
      }

      // 5. Build Pipeline Stage Counts
      const stages: PipelineStageCounts = {
        DISCOVERED: rawLeads.filter((l) => l.status === "NEW").length,
        RESEARCHED: rawLeads.filter((l) => l.leadScore !== undefined && l.leadScore !== null).length,
        QUALIFIED: rawLeads.filter((l) => l.status === "QUALIFIED").length,
        CALL_READY: readyToCall,
        CONTACTED: rawLeads.filter((l) => l.status === "CONTACTED").length,
        INTERESTED: rawCalls.filter((c) => c.outcome?.outcomeType === "INTERESTED").length,
        MEETING: meetings,
        WON: 0,
      };
      setStageCounts(stages);

      // 6. Build Recent Activity Stream from Real Data
      const activityStream: ActivityItem[] = [];

      rawCalls.slice(0, 4).forEach((call) => {
        let variant: ActivityItem["statusVariant"] = "secondary";
        if (call.status === "COMPLETED") variant = "success";
        else if (call.status === "APPROVAL_REQUIRED") variant = "warning";
        else if (call.status === "FAILED") variant = "danger";

        const targetName = call.lead?.businessName || "Unknown Prospect";
        const timeAgo = formatTimeAgo(call.createdAt);

        activityStream.push({
          id: `call-${call.id}`,
          type: "call",
          event: "Voice Call Session",
          targetName,
          timestamp: timeAgo,
          status: call.status.replace("_", " "),
          statusVariant: variant,
          href: `/calling/calls`,
        });
      });

      rawLeads.slice(0, 4).forEach((lead) => {
        const timeAgo = formatTimeAgo(lead.createdAt);
        let variant: ActivityItem["statusVariant"] = "secondary";
        if (lead.status === "QUALIFIED") variant = "success";
        else if (lead.status === "NEW") variant = "info";

        activityStream.push({
          id: `lead-${lead.id}`,
          type: "lead",
          event: "Lead Added",
          targetName: lead.businessName,
          timestamp: timeAgo,
          status: lead.status,
          statusVariant: variant,
          href: `/leads`,
        });
      });

      setActivities(activityStream.slice(0, 6));
    } catch {
      // Fallback state on network error
      setTotalLeads(0);
      setQualifiedLeads(0);
      setQualificationRate(0);
      setReadyToCallCount(0);
      setCallsTodayCount(0);
      setApprovalRequiredCount(0);
      setMeetingsCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Helper for human-readable relative time
  function formatTimeAgo(isoString?: string) {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  }

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* 1. Header: Acquisition Command Center */}
      <PageHeader
        title="Acquisition Command Center"
        description="Real-time acquisition status, operational queues, and call readiness."
        breadcrumbs={[
          { label: "closeVDS", href: "/dashboard" },
          { label: "Overview" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <button className="px-3 py-1.5 rounded-lg bg-[#0e0e14] hover:bg-[#14141e] border border-white/[0.08] hover:border-white/[0.18] text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Import Leads</span>
              </button>
            </Link>
            <Link href="/operations">
              <button className="px-3 py-1.5 rounded-lg bg-[#0e0e14] hover:bg-[#14141e] border border-white/[0.08] hover:border-white/[0.18] text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
                <span>Open Operations</span>
              </button>
            </Link>
            <Link href="/calling">
              <button className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 border border-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>AI Calling</span>
              </button>
            </Link>
          </div>
        }
      />

      {/* 2. Health KPIs (5 Metrics: Leads, Qualified, Call Ready, Calls Today, Meetings) */}
      <AcquisitionHealthStrip
        metrics={{
          totalLeads,
          qualifiedLeads,
          qualificationRate,
          readyToCallCount,
          callsTodayCount,
          approvalRequiredCount,
          meetingsCount,
          isLoading,
        }}
      />

      {/* 3. Action Required ("What needs attention" queue) */}
      <ActionRequired
        unqualifiedLeadsCount={unqualifiedLeadsCount}
        pendingApprovalCallsCount={approvalRequiredCount ?? 0}
        configuredProvidersCount={configuredProvidersCount}
        hasAgentConfig={hasAgentConfig}
        isLoading={isLoading}
      />

      {/* 4. Acquisition Pipeline (One single canonical visual pipeline) */}
      <PipelineIntelligence
        stageCounts={stageCounts}
        totalLeads={totalLeads ?? 0}
        isLoading={isLoading}
      />

      {/* 5. closeBDS Discovery Status + Lead Pool Preview */}
      <LeadDiscoveryCard recentLeads={recentLeads} isLoading={isLoading} />

      {/* 6. Calling Readiness (Voice Provider, AI Agent, Human Approval, Safety + CALLING STATUS) */}
      <CallingReadiness
        configuredProvidersCount={configuredProvidersCount}
        hasAgentConfig={hasAgentConfig}
        isLoading={isLoading}
      />

      {/* 7. Recent Activity (Compact event timeline) */}
      <RecentActivity activities={activities} isLoading={isLoading} />

      {/* 8. Compact Safety Status (Human approval, DNC, AI grounding, Kill switch, Circuit breaker) */}
      <SafetyGovernance />
    </PageContainer>
  );
}
