"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CrmPipelineBoard } from "@/components/crm/crm-pipeline-board";
import { CrmDealModal } from "@/components/crm/crm-deal-modal";
import { PermissionGateBanner } from "@/components/shared/permission-gate-banner";
import { api, ApiClientError } from "@/lib/api-client";
import { mapBackendLeadToCrmDeal } from "@/lib/mappers";
import { CrmDealItem } from "@/types/crm";

export default function CRMPage() {
  const [deals, setDeals] = useState<CrmDealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mutationSuccess, setMutationSuccess] = useState<string | null>(null);

  // Selected deal for inspection modal
  const [selectedDealForModal, setSelectedDealForModal] = useState<CrmDealItem | null>(null);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.leads.list({ limit: 100 });
      if (Array.isArray(response?.data)) {
        setDeals(response.data.map(mapBackendLeadToCrmDeal));
      } else {
        setDeals([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message || "Failed to load CRM pipeline deals.");
      } else {
        setErrorMsg("Failed to connect to CRM service.");
      }
      setDeals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleQuickStageChange = async (deal: CrmDealItem, nextStatus: string) => {
    setErrorMsg(null);
    setMutationSuccess(null);
    try {
      await api.crm.updateStage(deal.leadId, { status: nextStatus });
      setMutationSuccess(`Moved ${deal.companyName} to ${nextStatus}`);
      await fetchDeals();
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(`Failed to transition ${deal.companyName} to ${nextStatus}.`);
      }
    }
  };

  // Pipeline telemetry metrics
  const pipelineMetrics = useMemo(() => {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((acc, d) => acc + (d.valueEstimate || 0), 0);
    const wonDeals = deals.filter((d) => d.stage === "closed_won");
    const wonValue = wonDeals.reduce((acc, d) => acc + (d.valueEstimate || 0), 0);
    const activeInFlight = deals.filter(
      (d) => !["closed_won", "closed_lost", "discovered"].includes(d.stage)
    ).length;

    return {
      totalDeals,
      totalValue,
      wonDealsCount: wonDeals.length,
      wonValue,
      activeInFlight,
    };
  }, [deals]);

  const formatCurrency = (val: number) => {
    if (val === 0) return "$0";
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <PageContainer maxWidth="full">
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Sales Pipeline"
          description="Visual acquisition pipeline tracking prospects from discovery through qualification, outreach approval, follow-ups, and closed deals."
          breadcrumbs={[
            { label: "closeVDS", href: "/dashboard" },
            { label: "Sales Pipeline" },
          ]}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDeals}
              disabled={isLoading}
              className="h-8.5 px-3.5 text-xs bg-[#0d0d12] hover:bg-[#14141c] text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh Pipeline</span>
            </Button>
          }
        />

        {/* Pipeline Telemetry Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Active Deals */}
          <div className="relative overflow-hidden rounded-xl bg-[#0d0d12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.14] shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Pipeline Volume
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono tracking-tight tabular-nums">
                {pipelineMetrics.totalDeals}
              </span>
              <span className="text-[11px] text-zinc-400">total prospects</span>
            </div>
          </div>

          {/* Total Estimated Pipeline Value */}
          <div className="relative overflow-hidden rounded-xl bg-[#0d0d12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.14] shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Pipeline Value
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400 font-mono tracking-tight tabular-nums">
                {formatCurrency(pipelineMetrics.totalValue)}
              </span>
              <span className="text-[11px] text-zinc-400">weighted potential</span>
            </div>
          </div>

          {/* In-Flight Deals */}
          <div className="relative overflow-hidden rounded-xl bg-[#0d0d12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.14] shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Active in Flight
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono tracking-tight tabular-nums">
                {pipelineMetrics.activeInFlight}
              </span>
              <span className="text-[11px] text-zinc-400">in qualification / touch</span>
            </div>
          </div>

          {/* Closed Won Revenue */}
          <div className="relative overflow-hidden rounded-xl bg-[#0d0d12] border border-white/[0.07] p-4 transition-all duration-150 hover:border-white/[0.14] shadow-xs">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                Closed Revenue
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono tracking-tight tabular-nums">
                {formatCurrency(pipelineMetrics.wonValue)}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                ({pipelineMetrics.wonDealsCount} won)
              </span>
            </div>
          </div>
        </div>

        {/* Gate 4 Follow-Up Flow Indicator */}
        <PermissionGateBanner currentStage="followup" />

        {/* Mutation Feedback */}
        {mutationSuccess && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{mutationSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setMutationSuccess(null)}
              className="text-xs text-emerald-400 hover:text-emerald-200 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="relative rounded-xl border border-rose-500/30 bg-[#140b0e] p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold block">
                CRM Pipeline Notice
              </span>
              <p className="text-xs text-rose-200/80 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Pipeline Board / Loading State */}
        {isLoading ? (
          <div className="relative p-14 text-center border border-white/[0.08] rounded-xl bg-[#0d0d12] shadow-xs overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
            <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Synchronizing CRM sales pipeline...
            </p>
          </div>
        ) : (
          <CrmPipelineBoard
            deals={deals}
            onSelectDeal={(deal) => setSelectedDealForModal(deal)}
            onQuickStageChange={handleQuickStageChange}
          />
        )}

        {/* Selected Deal Inspection / Stage Transition Modal */}
        <CrmDealModal
          deal={selectedDealForModal}
          isOpen={Boolean(selectedDealForModal)}
          onClose={() => setSelectedDealForModal(null)}
          onDealUpdated={fetchDeals}
        />
      </div>
    </PageContainer>
  );
}
