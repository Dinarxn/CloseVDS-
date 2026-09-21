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
import { Alert } from "@/components/ui/alert";
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <PageHeader
            title="Analytics &amp; Intelligence"
            description="Acquisition funnel metrics, qualification rates, and outbound AI voice calling performance."
            breadcrumbs={[
              { label: "Home", href: "/dashboard" },
              { label: "Analytics" },
            ]}
          />

          {/* Timeframe & Export Action */}
          <div className="flex items-center space-x-3 self-start sm:self-auto">
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
              variant="outline"
              size="md"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="text-xs h-9"
            >
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>

        {errorMsg && (
          <Alert variant="destructive" title="Analytics Error">
            {errorMsg}
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview">
          <TabList className="w-full sm:w-auto">
            <Tab value="overview">Acquisition Funnel</Tab>
            <Tab value="voice">AI Voice Analytics</Tab>
          </TabList>

          <TabPanel value="overview" className="pt-4 space-y-6">
            {isLoading ? (
              <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-400">Aggregating live analytics from workspace...</p>
              </div>
            ) : (
              <>
                <AnalyticsKpiGrid kpis={kpis} />
                <AcquisitionFunnelView />
                {kpis.leadsDiscovered === 0 && <AnalyticsEmptyState />}
              </>
            )}
          </TabPanel>

          <TabPanel value="voice" className="pt-4 space-y-6">
            {isLoading ? (
              <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-400">Aggregating voice telemetry metrics...</p>
              </div>
            ) : !voiceAnalytics || voiceAnalytics.totalCalls === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/[0.12] rounded-xl bg-[#121216]/60 space-y-2">
                <h4 className="text-sm font-semibold text-white">No voice outreach data recorded</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Metrics will display here automatically once AI voice outreach calls are prepared and dispatched.
                </p>
                <div className="pt-2">
                  <Link href="/calling" className="text-xs text-indigo-400 hover:underline">
                    Go to Calling Dashboard &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Voice Calling KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-1">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Total Calls</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">{voiceAnalytics.totalCalls}</div>
                    <div className="text-[10px] text-zinc-500">Placed in workspace</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-1">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Meetings Booked</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{voiceAnalytics.meetingsRequested}</div>
                    <div className="text-[10px] text-zinc-500">
                      {voiceAnalytics.totalCalls > 0
                        ? `${Math.round((voiceAnalytics.meetingsRequested / voiceAnalytics.totalCalls) * 100)}% conversion`
                        : "0%"}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-1">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Callbacks Requested</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-indigo-300">{voiceAnalytics.callbacksRequested}</div>
                    <div className="text-[10px] text-zinc-500">Tasks created in CRM</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121216] border border-white/[0.08] space-y-1">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Avg Call Duration</div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">
                      {formatCallDuration(voiceAnalytics.averageDurationSeconds)}
                    </div>
                    <div className="text-[10px] text-zinc-500">Live runtime</div>
                  </div>
                </div>

                {/* Breakdown by Status and by Outcome */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <div className="p-5 rounded-xl bg-[#121216] border border-white/[0.08] space-y-3">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      Calls by Telephony Status
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(voiceAnalytics.byStatus).map(([st, count]) => (
                        <div key={st} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
                          <span className="font-mono text-zinc-400">{st}</span>
                          <span className="font-semibold text-white font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcome Distribution */}
                  <div className="p-5 rounded-xl bg-[#121216] border border-white/[0.08] space-y-3">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                      Calls by AI Outcome
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(voiceAnalytics.byOutcome).length > 0 ? (
                        Object.entries(voiceAnalytics.byOutcome).map(([oc, count]) => (
                          <div key={oc} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04]">
                            <span className="font-medium text-white">{oc.replace(/_/g, " ")}</span>
                            <span className="font-semibold text-emerald-400 font-mono">{count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500">No outcomes classified yet.</p>
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

