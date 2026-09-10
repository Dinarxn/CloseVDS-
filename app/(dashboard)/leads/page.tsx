"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsCardGrid } from "@/components/leads/leads-card-grid";
import { LeadDiscoveryModal } from "@/components/leads/lead-discovery-modal";
import { PermissionGateBanner } from "@/components/shared/permission-gate-banner";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Lead, LeadFilterState, LeadSortOption, LeadViewMode } from "@/types/leads";
import { api, ApiClientError } from "@/lib/api-client";
import { mapBackendLeadToFrontend, type BackendLead } from "@/lib/mappers";
import { CallPreparationModal } from "@/components/calling/call-preparation-modal";

const INITIAL_FILTERS: LeadFilterState = {
  search: "",
  location: "",
  industry: "",
  companySize: "",
  status: "",
  qualification: "",
  source: "",
  campaign: "",
  minScore: 0,
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<LeadFilterState>(INITIAL_FILTERS);
  const [sortOption, setSortOption] = useState<LeadSortOption>("discovered_desc");
  const [viewMode, setViewMode] = useState<LeadViewMode>("table");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);

  const filterDisclosure = useDisclosure({ defaultIsOpen: false });
  const discoveryModal = useDisclosure({ defaultIsOpen: false });

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams();
      if (search.trim()) queryParams.set("search", search.trim());
      if (filters.status) queryParams.set("status", filters.status.toUpperCase());
      if (filters.campaign) queryParams.set("campaignId", filters.campaign);

      const qs = queryParams.toString();
      const endpoint = qs ? `/leads?${qs}` : "/leads";
      const response = await api.get<{ data: { items: BackendLead[]; total: number } }>(endpoint);

      if (response?.data?.items) {
        setLeads(response.data.items.map(mapBackendLeadToFrontend));
      } else {
        setLeads([]);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message || "Failed to load leads from server");
      } else {
        setErrorMsg("Failed to connect to leads API service");
      }
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, filters.status, filters.campaign]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (field: keyof LeadFilterState, value: unknown) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearch("");
  };

  // Count active non-default filters
  const activeFilterCount =
    Object.entries(filters).filter(([k, v]) => {
      if (k === "search" || k === "minScore") return false;
      return Boolean(v);
    }).length + (filters.minScore > 0 ? 1 : 0);

  const isFiltered = Boolean(search.trim()) || activeFilterCount > 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Leads"
          description="Prospect discovery, website gap intelligence, and qualification workspace."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Leads" },
          ]}
        />

        {/* Gate 1 Visual Flow Indicator */}
        <PermissionGateBanner currentStage="research" />

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Workspace Toolbar */}
        <LeadsToolbar
          search={search}
          onSearchChange={setSearch}
          isFilterOpen={filterDisclosure.isOpen}
          onToggleFilter={filterDisclosure.onToggle}
          activeFilterCount={activeFilterCount}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onFindLeads={discoveryModal.onOpen}
        />

        {/* Collapsible Filter Panel */}
        {filterDisclosure.isOpen && (
          <LeadsFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            onClose={filterDisclosure.onClose}
          />
        )}

        {/* Main Content Area: Table vs Cards with Loading State */}
        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-400">Loading leads from workspace...</p>
          </div>
        ) : viewMode === "table" ? (
          <LeadsTable
            leads={leads}
            onFindLeads={discoveryModal.onOpen}
            isFiltered={isFiltered}
            onClearFilters={handleResetFilters}
            onPrepareCall={(lead) => setSelectedLeadForCall(lead)}
          />
        ) : (
          <LeadsCardGrid
            leads={leads}
            onFindLeads={discoveryModal.onOpen}
            isFiltered={isFiltered}
            onClearFilters={handleResetFilters}
          />
        )}

        {/* Lead Discovery Modal */}
        <LeadDiscoveryModal
          isOpen={discoveryModal.isOpen}
          onClose={() => {
            discoveryModal.onClose();
            fetchLeads();
          }}
        />

        {/* Call Preparation Modal */}
        <CallPreparationModal
          isOpen={Boolean(selectedLeadForCall)}
          initialLeadId={selectedLeadForCall?.id || ""}
          onClose={() => setSelectedLeadForCall(null)}
        />
      </div>
    </PageContainer>
  );
}

