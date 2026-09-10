"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { CrmPipelineBoard } from "@/components/crm/crm-pipeline-board";
import { PermissionGateBanner } from "@/components/shared/permission-gate-banner";
import { api, ApiClientError } from "@/lib/api-client";
import { mapBackendLeadToCrmDeal, type BackendLead } from "@/lib/mappers";
import { CrmDealItem } from "@/types/crm";

export default function CRMPage() {
  const [deals, setDeals] = useState<CrmDealItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get<{ data: { items: BackendLead[] } }>("/leads?limit=50");
      if (response?.data?.items) {
        setDeals(response.data.items.map(mapBackendLeadToCrmDeal));
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
      <div className="space-y-6">
        <PageHeader
          title="CRM Pipeline"
          description="Visual acquisition pipeline tracking prospects from discovery through qualification, outreach approval, follow-ups, and closed deals."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "CRM" },
          ]}
        />

        {/* Gate 4 Follow-Up Flow Indicator */}
        <PermissionGateBanner currentStage="followup" />

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading CRM pipeline from workspace...</p>
          </div>
        ) : (
          <CrmPipelineBoard deals={deals} />
        )}
      </div>
    </PageContainer>
  );
}
