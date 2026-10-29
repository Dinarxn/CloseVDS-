"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AnalyticsKpiGrid } from "@/components/analytics/analytics-kpi-grid";
import { AcquisitionFunnelView } from "@/components/analytics/acquisition-funnel-view";
import { AnalyticsEmptyState } from "@/components/analytics/analytics-empty-state";
import { INITIAL_ZERO_KPIS } from "@/components/analytics/analytics-constants";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCallDuration } from "@/lib/mappers";
import type {
  AnalyticsTimeframe,
  AcquisitionKpis,
  OverviewMetrics,
  LeadsAnalytics,
  VoiceAnalytics,
  AcquisitionFunnelData,
  DateRangeFilter,
  FunnelStageMetric,
} from "@/types/analytics";

function getDateRange(timeframe: AnalyticsTimeframe): DateRangeFilter {
  if (timeframe === "all") return {};
  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return {
    from: fromDate.toISOString(),
    to: new Date().toISOString(),
  };
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");

  const [, setOverview] = useState<OverviewMetrics | null>(null);
  const [leadsAnalytics, setLeadsAnalytics] = useState<LeadsAnalytics | null>(null);
  const [voiceAnalytics, setVoiceAnalytics] = useState<VoiceAnalytics | null>(null);
  const [, setFunnelData] = useState<AcquisitionFunnelData | null>(null);

  const [kpis, setKpis] = useState<AcquisitionKpis>(INITIAL_ZERO_KPIS);
  const [funnelStages, setFunnelStages] = useState<FunnelStageMetric[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const filter = getDateRange(timeframe);

    try {
      const [overviewRes, leadsRes, voiceRes, funnelRes] = await Promise.allSettled([
        api.analytics.getOverview(filter),
        api.analytics.getLeads(filter),
        api.analytics.getVoice(filter),
        api.analytics.getAcquisitionFunnel(filter),
      ]);

      let loadedOverview: OverviewMetrics | null = null;
      let loadedVoice: VoiceAnalytics | null = null;
      let loadedFunnel: AcquisitionFunnelData | null = null;

      if (overviewRes.status === "fulfilled" && overviewRes.value?.metrics) {
        loadedOverview = overviewRes.value.metrics;
        setOverview(loadedOverview);
      }

      if (leadsRes.status === "fulfilled" && leadsRes.value?.leads) {
        setLeadsAnalytics(leadsRes.value.leads);
      }

      if (voiceRes.status === "fulfilled" && voiceRes.value?.voice) {
        loadedVoice = voiceRes.value.voice;
        setVoiceAnalytics(loadedVoice);
      }

      if (funnelRes.status === "fulfilled" && funnelRes.value?.data) {
        loadedFunnel = funnelRes.value.data;
        setFunnelData(loadedFunnel);
      }

      // Compute consistent KPIs with safe zero-division handling
      const totalLeads = loadedOverview?.leads?.total ?? 0;
      const qualRate = loadedOverview?.leads?.qualificationRate ?? 0;
      const dispatches = loadedOverview?.outreach?.sent ?? 0;
      const replyRate = loadedOverview?.leads?.replyRate ?? 0;
      const meetings = loadedVoice?.meetingsRequested ?? 0;
      const closed = loadedOverview?.leads?.byStatus?.WON ?? 0;

      setKpis({
        leadsDiscovered: totalLeads,
        qualificationRate: Math.round(qualRate),
        approvedDispatches: dispatches,
        replyRate: Math.round(replyRate),
        meetingsBooked: meetings,
        clientsClosed: closed,
      });

      // Construct live dynamic 7-stage acquisition funnel from verified nested backend contract
      if (
        loadedFunnel &&
        loadedFunnel.leadPool &&
        loadedFunnel.voiceQueue &&
        loadedFunnel.conversions
      ) {
        const pool = loadedFunnel.leadPool.total;
        const qualified = loadedFunnel.leadPool.qualified;
        const queuedCalls = loadedFunnel.voiceQueue.queued;
        const approvedCalls = loadedFunnel.voiceQueue.approved;
        const queuedOrApproved = queuedCalls + approvedCalls;
        const callsCount = loadedFunnel.voiceQueue.totalCalls;
        const completedCalls = loadedFunnel.voiceQueue.completed;
        const connectRate = loadedFunnel.voiceQueue.connectRate;
        const meetingsCount = loadedFunnel.conversions.meetings;
        const clientsWon = loadedFunnel.conversions.won;

        setFunnelStages([
          {
            stageId: "pool",
            stageLabel: "01 Candidate Lead Pool",
            count: pool,
            conversionRateFromPrevious: 100,
            description: "Prospect dental clinics imported into workspace",
          },
          {
            stageId: "qualification",
            stageLabel: "02 AI Qualified Prospects",
            count: qualified,
            conversionRateFromPrevious: pool > 0 ? Math.round((qualified / pool) * 100) : 0,
            description: "Website audited & scored above qualification threshold",
          },
          {
            stageId: "readiness",
            stageLabel: "03 Outbound Call-Ready & Approved",
            count: queuedOrApproved,
            conversionRateFromPrevious: qualified > 0 ? Math.round((queuedOrApproved / qualified) * 100) : 0,
            description: "Passed human review & queued for voice outreach",
          },
          {
            stageId: "outreach",
            stageLabel: "04 Voice Outreach Dispatched",
            count: callsCount,
            conversionRateFromPrevious: queuedOrApproved > 0 ? Math.round((callsCount / queuedOrApproved) * 100) : 0,
            description: "Outbound calling sessions initiated by AI agent",
          },
          {
            stageId: "completed",
            stageLabel: "05 Voice Calls Completed",
            count: completedCalls,
            conversionRateFromPrevious: callsCount > 0 ? Math.round((completedCalls / callsCount) * 100) : 0,
            description: `Calling sessions completed (${connectRate}% connect rate)`,
          },
          {
            stageId: "meeting",
            stageLabel: "06 Discovery Meetings & Callbacks",
            count: meetingsCount,
            conversionRateFromPrevious: completedCalls > 0 ? Math.round((meetingsCount / completedCalls) * 100) : 0,
            description: "Positive intent confirmed; callback or meeting scheduled",
          },
          {
            stageId: "closed",
            stageLabel: "07 Closed Won Clients",
            count: clientsWon,
            conversionRateFromPrevious: meetingsCount > 0 ? Math.round((clientsWon / meetingsCount) * 100) : 0,
            description: "Prospects converted to active acquired clients",
          },
        ]);
      } else {
        // Do not substitute unrelated overview metrics if funnel data is missing
        setFunnelStages([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message || "Failed to load workspace analytics.");
      } else {
        setErrorMsg("Failed to connect to analytics service.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const filter = getDateRange(timeframe);
      const csvResponse = await api.analytics.exportReport({
        format: "csv",
        from: filter.from,
        to: filter.to,
      });

      const csvText = typeof csvResponse === "string" ? csvResponse : (csvResponse as { data?: string })?.data;
      if (!csvText || typeof csvText !== "string" || csvText.trim().length === 0) {
        throw new Error("Export completed but returned empty or invalid CSV content.");
      }

      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `closevds-leads-${timeframe}-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setExportError(err.message || "Failed to download export report.");
      } else if (err instanceof Error) {
        setExportError(err.message);
      } else {
        setExportError("Failed to export analytics data.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <PageHeader
            title="Sales Analytics & Intelligence"
            description="Verified acquisition funnel performance, pipeline progression, and outbound AI voice telemetry."
            breadcrumbs={[
              { label: "closeVDS", href: "/dashboard" },
              { label: "Analytics" },
            ]}
          />

          {/* Timeframe & Export Action */}
          <div className="flex items-center space-x-2.5 self-start sm:self-auto shrink-0">
            <div className="w-36">
              <Select
                id="analytics-timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as AnalyticsTimeframe)}
                options={[
                  { value: "7d", label: "Last 7 days" },
                  { value: "30d", label: "Last 30 days" },
                  { value: "90d", label: "Last 90 days" },
                  { value: "all", label: "All time" },
                ]}
              />
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="text-xs h-9 px-3.5 flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="relative rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold block">
                Analytics Service Error
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans">{errorMsg}</p>
            </div>
          </div>
        )}

        {exportError && (
          <div className="relative rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold block">
                Export Error
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed font-sans">{exportError}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" variant="pills">
          <TabList className="w-full sm:w-auto">
            <Tab value="overview">
              Acquisition Funnel &amp; KPIs
            </Tab>
            <Tab value="pipeline">
              Pipeline Stage Breakdown
            </Tab>
            <Tab value="voice">
              AI Voice Outreach Telemetry
            </Tab>
          </TabList>

          {/* TAB 1: Acquisition Funnel & KPIs */}
          <TabPanel value="overview" className="pt-4 space-y-5">
            {isLoading ? (
              <div className="relative p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Aggregating live analytics from workspace...
                </p>
              </div>
            ) : (
              <>
                <AnalyticsKpiGrid kpis={kpis} />
                <AcquisitionFunnelView stages={funnelStages.length > 0 ? funnelStages : undefined} />
                {kpis.leadsDiscovered === 0 && <AnalyticsEmptyState />}
              </>
            )}
          </TabPanel>

          {/* TAB 2: Pipeline Stage Breakdown */}
          <TabPanel value="pipeline" className="pt-4 space-y-5">
            {isLoading ? (
              <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-xs">
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Loading pipeline stage breakdown...
                </p>
              </div>
            ) : leadsAnalytics?.stages && leadsAnalytics.stages.length > 0 ? (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-5 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        Pipeline Distribution by Canonical Stage
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5">
                        Exact counts and proportion of leads in each CRM lifecycle status
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08] tabular-nums">
                      {leadsAnalytics.totalLeads} Total Prospects
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {leadsAnalytics.stages.map((st) => (
                      <div
                        key={st.stage}
                        className="p-3.5 bg-surface-panel border border-white/[0.07] hover:border-white/[0.14] rounded-xl text-xs space-y-2 transition-all duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                            <span className="font-mono text-zinc-200 font-semibold text-xs">
                              {st.stage}
                            </span>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Count</span>
                              <span className="font-mono text-white font-bold tabular-nums">{st.count}</span>
                            </div>
                            <div className="text-right min-w-[50px]">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Share</span>
                              <span className="font-mono text-white font-semibold tabular-nums">{st.percentage}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Subtle proportion bar */}
                        <div className="h-1 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-zinc-500 to-zinc-200 rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(2, st.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score Summary */}
                {leadsAnalytics.scoreSummary && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="relative p-4 rounded-xl border border-white/[0.08] bg-surface-card space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Avg Relevance Score</span>
                      <div className="text-2xl font-bold font-mono tabular-nums text-white">
                        {leadsAnalytics.scoreSummary.averageRelevance}/100
                      </div>
                    </div>
                    <div className="relative p-4 rounded-xl border border-white/[0.08] bg-surface-card space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Avg Opportunity Score</span>
                      <div className="text-2xl font-bold font-mono tabular-nums text-white">
                        {leadsAnalytics.scoreSummary.averageOpportunity}/100
                      </div>
                    </div>
                    <div className="relative p-4 rounded-xl border border-white/[0.08] bg-surface-card space-y-1 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">Avg Composite Total</span>
                      <div className="text-2xl font-bold font-mono tabular-nums text-white">
                        {leadsAnalytics.scoreSummary.averageTotalScore}/100
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center border border-dashed border-white/[0.08] rounded-xl bg-surface-card text-xs text-zinc-400 font-sans">
                No pipeline stage distribution data found for this timeframe.
              </div>
            )}
          </TabPanel>

          {/* TAB 3: AI Voice Analytics */}
          <TabPanel value="voice" className="pt-4 space-y-5">
            {isLoading ? (
              <div className="relative p-12 text-center border border-white/[0.08] rounded-xl bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Aggregating voice telemetry metrics...
                </p>
              </div>
            ) : !voiceAnalytics || voiceAnalytics.totalCalls === 0 ? (
              <div className="relative p-10 sm:p-14 text-center border border-white/[0.08] rounded-xl bg-surface-card space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400 shadow-xs">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                    Voice Telemetry
                  </span>
                  <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                    No voice outreach data recorded
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
                    Metrics will display here automatically once AI voice outreach calls are prepared and dispatched.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/calling">
                    <Button variant="secondary" size="sm" className="h-8.5 px-4 text-xs font-medium">
                      Go to Calling Dashboard →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Voice Calling KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Total Calls</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">{voiceAnalytics.totalCalls}</div>
                    <div className="text-[11px] text-zinc-400 font-sans">Placed in workspace</div>
                  </div>

                  <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Meetings Booked</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">{voiceAnalytics.meetingsRequested}</div>
                    <div className="text-[11px] text-zinc-400 font-sans">
                      {voiceAnalytics.totalCalls > 0
                        ? `${Math.round((voiceAnalytics.meetingsRequested / voiceAnalytics.totalCalls) * 100)}% conversion`
                        : "0%"}
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Callbacks Requested</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">{voiceAnalytics.callbacksRequested}</div>
                    <div className="text-[11px] text-zinc-400 font-sans">Tasks created in CRM</div>
                  </div>

                  <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-4 space-y-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Avg Call Duration</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
                      {formatCallDuration(voiceAnalytics.averageDurationSeconds)}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans">Live runtime</div>
                  </div>
                </div>

                {/* Breakdown by Status and by Outcome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Status Distribution */}
                  <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        Calls by Telephony Status
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">Live Telephony</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(voiceAnalytics.byStatus || {}).map(([st, count]) => (
                        <div key={st} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04]">
                          <span className="font-mono text-zinc-300">{st}</span>
                          <span className="font-semibold text-white font-mono tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcome Distribution */}
                  <div className="relative rounded-xl border border-white/[0.08] bg-surface-card p-5 space-y-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        Calls by AI Outcome
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">Classified Outcomes</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(voiceAnalytics.byOutcome || {}).length > 0 ? (
                        Object.entries(voiceAnalytics.byOutcome || {}).map(([oc, count]) => (
                          <div key={oc} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04]">
                            <span className="font-medium text-zinc-200 capitalize font-sans">{oc.replace(/_/g, " ").toLowerCase()}</span>
                            <span className="font-semibold text-white font-mono tabular-nums">{count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 py-2 font-sans">No outcomes classified yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabPanel>
        </Tabs>
      </div>
    </PageContainer>
  );
}
