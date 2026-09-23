"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsCardGrid } from "@/components/leads/leads-card-grid";
import { LeadDiscoveryModal } from "@/components/leads/lead-discovery-modal";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import { PermissionGateBanner } from "@/components/shared/permission-gate-banner";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Lead, LeadFilterState, LeadSortOption, LeadViewMode } from "@/types/leads";
import { api, ApiClientError } from "@/lib/api-client";
import { mapBackendLeadToFrontend } from "@/lib/mappers";
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

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);

  const filterDisclosure = useDisclosure({ defaultIsOpen: false });
  const discoveryModal = useDisclosure({ defaultIsOpen: false });

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.leads.list({
        search: search.trim() || undefined,
        status: filters.status ? filters.status.toUpperCase() : undefined,
      });

      const rawItems = Array.isArray(response?.data)
        ? response.data
        : [];

      setLeads(rawItems.map(mapBackendLeadToFrontend));
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE") {
          setErrorMsg(
            "Cannot reach database server. Please verify PostgreSQL connection."
          );
        } else if (err.statusCode === 401) {
          setErrorMsg("Your session has expired. Please log in again.");
        } else {
          setErrorMsg(err.message || "Failed to load leads from server");
        }
      } else {
        setErrorMsg("Unable to connect to backend API server.");
      }
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, filters.status]);

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
    <PageContainer maxWidth="xl" className="space-y-3.5 sm:space-y-4">
      <PageHeader
        title="Leads"
        description="Prospect discovery, website gap intelligence, and qualification workspace."
        breadcrumbs={[
          { label: "closeVDS", href: "/dashboard" },
          { label: "Leads" },
        ]}
      />

      {/* Gate 1 Supporting Sequence Indicator */}
      <PermissionGateBanner currentStage="research" />

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 backdrop-blur-sm">
          <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="leading-relaxed font-mono">{errorMsg}</span>
        </div>
      )}

      {/* Lead Workspace Control Surface (The Hero) */}
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
        <div className="relative p-8 text-center border border-white/[0.08] rounded-xl bg-[#09090f]/95 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm space-y-2">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-zinc-400">Loading prospects from workspace...</p>
        </div>
      ) : viewMode === "table" ? (
        <LeadsTable
          leads={leads}
          onFindLeads={discoveryModal.onOpen}
          isFiltered={isFiltered}
          onClearFilters={handleResetFilters}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          onPrepareCall={(lead) => setSelectedLeadForCall(lead)}
        />
      ) : (
        <LeadsCardGrid
          leads={leads}
          onFindLeads={discoveryModal.onOpen}
          isFiltered={isFiltered}
          onClearFilters={handleResetFilters}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
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

        {/* Lead Detail & AI Analysis Dossier Modal */}
        <LeadDetailModal
          isOpen={Boolean(selectedLeadId)}
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={fetchLeads}
        />

        {/* Call Preparation Modal */}
        <CallPreparationModal
          isOpen={Boolean(selectedLeadForCall)}
          initialLeadId={selectedLeadForCall?.id || ""}
          onClose={() => setSelectedLeadForCall(null)}
        />
    </PageContainer>
  );
}

