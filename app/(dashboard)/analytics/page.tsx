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
import { AnalyticsTimeframe, AcquisitionKpis } from "@/types/analytics";
import { api, ApiClientError } from "@/lib/api-client";

import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { VoiceAnalyticsData } from "@/types/calling";
import { formatCallDuration } from "@/lib/mappers";

interface BackendOverviewMetrics {
  leads?: {
    total?: number;
    qualificationRate?: number;
    replyRate?: number;
    byStatus?: Record<string, number>;
  };
  outreach?: {
    total?: number;
    sent?: number;
    approved?: number;
    draft?: number;
  };
  crm?: {
    totalActivities?: number;
  };
  tasks?: {
    completed?: number;
  };
  totalLeads?: number;
  qualificationRate?: number;
  deliveredMessages?: number;
  replyRate?: number;
  repliesCount?: number;
  wonDeals?: number;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("30d");
  const [kpis, setKpis] = useState<AcquisitionKpis>(INITIAL_ZERO_KPIS);
  const [voiceAnalytics, setVoiceAnalytics] = useState<VoiceAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [overviewRes, voiceRes] = await Promise.allSettled([
        api.get<{ metrics?: BackendOverviewMetrics; data?: BackendOverviewMetrics }>("/analytics/overview"),
        api.voice.getVoiceAnalytics(),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value) {
        const val = overviewRes.value;
        const m = val.metrics || val.data;
        if (m) {
          const leadsTotal = m.leads?.total ?? m.totalLeads ?? 0;
          const qualRate = m.leads?.qualificationRate ?? m.qualificationRate ?? 0;
          const dispatches = m.outreach?.sent ?? m.outreach?.approved ?? m.deliveredMessages ?? 0;
          const repRate = m.leads?.replyRate ?? m.replyRate ?? 0;
          const meetings = m.crm?.totalActivities ?? m.repliesCount ?? 0;
          const closed = m.leads?.byStatus?.CLOSED_DEAL ?? m.wonDeals ?? 0;

          setKpis({
            leadsDiscovered: leadsTotal,
            qualificationRate: Math.round(qualRate),
            approvedDispatches: dispatches,
            replyRate: Math.round(repRate),
            meetingsBooked: meetings,
            clientsClosed: closed,
          });
        }
      }

      if (voiceRes.status === "fulfilled" && voiceRes.value?.voice) {
        setVoiceAnalytics(voiceRes.value.voice);
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
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const response = await api.get<{ data: string }>("/analytics/export?format=csv");
      if (response?.data) {
        const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `closevds-analytics-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Analytics &amp; Intelligence"
            description="Acquisition funnel metrics, qualification rates, and outbound AI voice calling performance."
            breadcrumbs={[
              { label: "closeVDS", href: "/dashboard" },
              { label: "Analytics" },
            ]}
          />

          {/* Timeframe & Export Action */}
          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
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
              className="text-xs h-8.5 px-3 bg-[#101017] hover:bg-[#161622] text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="relative rounded-xl border border-rose-500/30 bg-[#140b0e] p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold block">
                Analytics Service Error
              </span>
              <p className="text-xs text-rose-200/80 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview" variant="pills">
          <TabList className="w-full sm:w-auto">
            <Tab value="overview">
              Acquisition Funnel
            </Tab>
            <Tab value="voice">
              AI Voice Analytics
            </Tab>
          </TabList>

          <TabPanel value="overview" className="pt-4 space-y-5">
            {isLoading ? (
              <div className="relative p-12 text-center border border-white/[0.08] rounded-xl bg-[#0c0c12]/90 shadow-xs overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Aggregating live analytics from workspace...
                </p>
              </div>
            ) : (
              <>
                <AnalyticsKpiGrid kpis={kpis} />
                <AcquisitionFunnelView />
                {kpis.leadsDiscovered === 0 && <AnalyticsEmptyState />}
              </>
            )}
          </TabPanel>

          <TabPanel value="voice" className="pt-4 space-y-5">
            {isLoading ? (
              <div className="relative p-12 text-center border border-white/[0.08] rounded-xl bg-[#0c0c12]/90 shadow-xs overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Aggregating voice telemetry metrics...
                </p>
              </div>
            ) : !voiceAnalytics || voiceAnalytics.totalCalls === 0 ? (
              <div className="relative p-10 sm:p-14 text-center border border-white/[0.08] rounded-xl bg-[#09090f]/90 space-y-3.5 shadow-xs overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
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
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Metrics will display here automatically once AI voice outreach calls are prepared and dispatched.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/calling">
                    <Button variant="secondary" size="sm" className="h-8 px-3.5 text-xs shadow-xs font-medium">
                      Go to Calling Dashboard →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Voice Calling KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-4 space-y-1.5 shadow-xs overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Total Calls</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">{voiceAnalytics.totalCalls}</div>
                    <div className="text-[10px] text-zinc-400">Placed in workspace</div>
                  </div>

                  <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-4 space-y-1.5 shadow-xs overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Meetings Booked</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 tracking-tight">{voiceAnalytics.meetingsRequested}</div>
                    <div className="text-[10px] text-zinc-400">
                      {voiceAnalytics.totalCalls > 0
                        ? `${Math.round((voiceAnalytics.meetingsRequested / voiceAnalytics.totalCalls) * 100)}% conversion`
                        : "0%"}
                    </div>
                  </div>

                  <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-4 space-y-1.5 shadow-xs overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Callbacks Requested</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-indigo-300 tracking-tight">{voiceAnalytics.callbacksRequested}</div>
                    <div className="text-[10px] text-zinc-400">Tasks created in CRM</div>
                  </div>

                  <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-4 space-y-1.5 shadow-xs overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-medium">Avg Call Duration</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
                      {formatCallDuration(voiceAnalytics.averageDurationSeconds)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Live runtime</div>
                  </div>
                </div>

                {/* Breakdown by Status and by Outcome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Status Distribution */}
                  <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-5 space-y-3.5 shadow-xs overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        Calls by Telephony Status
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">Live Telephony</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(voiceAnalytics.byStatus).map(([st, count]) => (
                        <div key={st} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04]">
                          <span className="font-mono text-zinc-300">{st}</span>
                          <span className="font-semibold text-white font-mono tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcome Distribution */}
                  <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 p-5 space-y-3.5 shadow-xs overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        Calls by AI Outcome
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500">Classified Outcomes</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(voiceAnalytics.byOutcome).length > 0 ? (
                        Object.entries(voiceAnalytics.byOutcome).map(([oc, count]) => (
                          <div key={oc} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04]">
                            <span className="font-medium text-zinc-200 capitalize">{oc.replace(/_/g, " ").toLowerCase()}</span>
                            <span className="font-semibold text-emerald-400 font-mono tabular-nums">{count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 py-2">No outcomes classified yet.</p>
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

