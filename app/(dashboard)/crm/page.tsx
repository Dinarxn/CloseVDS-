"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CrmPipelineBoard } from "@/components/crm/crm-pipeline-board";
import { PermissionGateBanner } from "@/components/shared/permission-gate-banner";
import { api, ApiClientError } from "@/lib/api-client";
import { mapBackendLeadToCrmDeal } from "@/lib/mappers";
import { CrmDealItem } from "@/types/crm";

export default function CRMPage() {
  const [deals, setDeals] = useState<CrmDealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.leads.list({ limit: 50 });
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

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageHeader
          title="CRM Pipeline"
          description="Visual acquisition pipeline tracking prospects from discovery through qualification, outreach approval, follow-ups, and closed deals."
          breadcrumbs={[
            { label: "closeVDS", href: "/dashboard" },
            { label: "CRM Pipeline" },
          ]}
        />

        {/* Gate 4 Follow-Up Flow Indicator */}
        <PermissionGateBanner currentStage="followup" />

        {errorMsg && (
          <div className="relative rounded-xl border border-rose-500/30 bg-[#140b0e] p-4 flex items-start gap-3 shadow-xs">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-semibold block">
                CRM Service Error
              </span>
              <p className="text-xs text-rose-200/80 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="relative p-12 text-center border border-white/[0.08] rounded-xl bg-[#0c0c12]/90 shadow-xs overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Loading CRM pipeline from workspace...
            </p>
          </div>
        ) : (
          <CrmPipelineBoard deals={deals} />
        )}
      </div>
    </PageContainer>
  );
}
