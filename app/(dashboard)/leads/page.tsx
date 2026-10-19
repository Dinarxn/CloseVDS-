"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsCardGrid } from "@/components/leads/leads-card-grid";
import { LeadsPipelineView } from "@/components/leads/leads-pipeline-view";
import { LeadDiscoveryModal } from "@/components/leads/lead-discovery-modal";
import { LeadImportModal } from "@/components/leads/lead-import-modal";
import { LeadDetailModal } from "@/components/leads/lead-detail-modal";
import { PermissionGateBanner } from "@/components/shared/permission-gate-banner";
import { useDisclosure } from "@/hooks/use-disclosure";
import { Lead, LeadFilterState, LeadSortOption, LeadStatus, LeadViewMode } from "@/types/leads";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<LeadFilterState>(INITIAL_FILTERS);
  const [sortOption, setSortOption] = useState<LeadSortOption>("discovered_desc");
  const [viewMode, setViewMode] = useState<LeadViewMode>("table");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination state backed by existing API contract
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);

  const filterDisclosure = useDisclosure({ defaultIsOpen: false });
  const discoveryModal = useDisclosure({ defaultIsOpen: false });
  const importModal = useDisclosure({ defaultIsOpen: false });

  // Debounce search input to avoid unnecessary requests while typing
  useEffect(() => {
    if (!search) {
      setDebouncedSearch("");
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.leads.list({
        search: debouncedSearch.trim() || undefined,
        status: filters.status ? filters.status.toUpperCase() : undefined,
        page,
        limit: pageSize,
      });

      const rawItems = Array.isArray(response?.data)
        ? response.data
        : [];

      setLeads(rawItems.map(mapBackendLeadToFrontend));
      const respTotal = typeof response?.total === "number" ? response.total : rawItems.length;
      setTotal(respTotal);
      const respTotalPages = typeof response?.totalPages === "number" && response.totalPages > 0
        ? response.totalPages
        : Math.max(1, Math.ceil(respTotal / pageSize));
      setTotalPages(respTotalPages);
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
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filters.status, page, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilterChange = (field: keyof LeadFilterState, value: unknown) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearch("");
    setDebouncedSearch("");
    setSortOption("discovered_desc");
    setPage(1);
  };

  const handleLeadStatusChange = (leadId: string, newStatus: LeadStatus) => {
    // Optimistically update local view, then refresh list from server
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    fetchLeads();
  };

  // Safe client-side sorting of loaded dataset
  const sortedLeads = useMemo(() => {
    const list = [...leads];
    switch (sortOption) {
      case "discovered_desc":
        return list.sort((a, b) => {
          const timeA = a.discoveredAt ? new Date(a.discoveredAt).getTime() : 0;
          const timeB = b.discoveredAt ? new Date(b.discoveredAt).getTime() : 0;
          return timeB - timeA;
        });
      case "discovered_asc":
        return list.sort((a, b) => {
          const timeA = a.discoveredAt ? new Date(a.discoveredAt).getTime() : 0;
          const timeB = b.discoveredAt ? new Date(b.discoveredAt).getTime() : 0;
          return timeA - timeB;
        });
      case "company_asc":
        return list.sort((a, b) =>
          (a.companyName || "").localeCompare(b.companyName || "", undefined, {
            sensitivity: "base",
            numeric: true,
          })
        );
      case "score_desc":
        return list.sort((a, b) => {
          const scoreA = a.qualification?.totalScore ?? -1;
          const scoreB = b.qualification?.totalScore ?? -1;
          return scoreB - scoreA;
        });
      case "score_asc":
        return list.sort((a, b) => {
          const scoreA = a.qualification?.totalScore ?? 999;
          const scoreB = b.qualification?.totalScore ?? 999;
          return scoreA - scoreB;
        });
      default:
        return list;
    }
  }, [leads, sortOption]);

  // Count active non-default filters
  const activeFilterCount =
    Object.entries(filters).filter(([k, v]) => {
      if (k === "search" || k === "minScore") return false;
      return Boolean(v);
    }).length + (filters.minScore > 0 ? 1 : 0);

  const isFiltered = Boolean(search.trim()) || activeFilterCount > 0;

  // Pagination display values
  const startItem = total > 0 ? (page - 1) * pageSize + 1 : (leads.length > 0 ? 1 : 0);
  const endItem = total > 0 ? Math.min(page * pageSize, total) : leads.length;
  const totalCount = total > 0 ? total : leads.length;

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
        <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2.5 backdrop-blur-sm">
          <div className="flex items-start space-x-2.5">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="leading-relaxed font-mono">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={fetchLeads}
            className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 transition-colors shrink-0 text-xs font-sans cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Lead Workspace Control Surface (The Hero) */}
      <LeadsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        isFilterOpen={filterDisclosure.isOpen}
        onToggleFilter={filterDisclosure.onToggle}
        activeFilterCount={activeFilterCount}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFindLeads={discoveryModal.onOpen}
        onImportLeads={importModal.onOpen}
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
        <div className="relative p-8 text-center border border-white/[0.06] rounded-xl bg-[#0a0a0f] shadow-xs backdrop-blur-sm space-y-2">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono text-zinc-400">Loading prospects from workspace...</p>
        </div>
      ) : viewMode === "table" ? (
        <LeadsTable
          leads={sortedLeads}
          onFindLeads={discoveryModal.onOpen}
          onImportLeads={importModal.onOpen}
          isFiltered={isFiltered}
          onClearFilters={handleResetFilters}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          onPrepareCall={(lead) => setSelectedLeadForCall(lead)}
          onLeadStatusChanged={handleLeadStatusChange}
        />
      ) : viewMode === "cards" ? (
        <LeadsCardGrid
          leads={sortedLeads}
          onFindLeads={discoveryModal.onOpen}
          onImportLeads={importModal.onOpen}
          isFiltered={isFiltered}
          onClearFilters={handleResetFilters}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          onLeadStatusChanged={handleLeadStatusChange}
        />
      ) : (
        <LeadsPipelineView
          leads={sortedLeads}
          onSelectLead={(lead) => setSelectedLeadId(lead.id)}
          onLeadStatusChanged={handleLeadStatusChange}
          page={page}
          totalPages={totalPages}
          total={total}
          onPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
          isLoading={isLoading}
        />
      )}

      {/* Pagination Surface for Table/Cards Views */}
      {!isLoading && viewMode !== "pipeline" && leads.length > 0 && (
        <div className="relative p-2.5 sm:p-3 bg-[#0a0a0f] border border-white/[0.06] rounded-xl shadow-xs backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Top specular hairline highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

          <div className="text-[11px] font-mono text-zinc-400">
            Showing <span className="text-zinc-100 font-medium">{startItem}</span>–<span className="text-zinc-100 font-medium">{endItem}</span> of{" "}
            <span className="text-zinc-100 font-medium">{totalCount}</span> leads
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="h-8 px-3 rounded-lg border text-xs font-medium font-sans flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white border-white/[0.07] disabled:hover:bg-white/[0.03] disabled:hover:text-zinc-300"
              aria-label="Previous page"
            >
              <span>←</span>
              <span>Previous</span>
            </button>

            <div className="h-8 px-3 rounded-lg border border-white/[0.06] bg-[#07070a] flex items-center text-xs font-mono text-zinc-400">
              <span>Page</span>
              <span className="text-white font-semibold mx-1.5">{page}</span>
              <span>of</span>
              <span className="text-white font-semibold ml-1.5">{totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="h-8 px-3 rounded-lg border text-xs font-medium font-sans flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/[0.03] hover:bg-white/[0.07] text-zinc-300 hover:text-white border-white/[0.07] disabled:hover:bg-white/[0.03] disabled:hover:text-zinc-300"
              aria-label="Next page"
            >
              <span>Next</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Lead Discovery Modal */}
      <LeadDiscoveryModal
        isOpen={discoveryModal.isOpen}
        onClose={() => {
          discoveryModal.onClose();
          fetchLeads();
        }}
      />

      {/* Lead Import Modal (V2 Import-First Foundation) */}
      <LeadImportModal
        isOpen={importModal.isOpen}
        onClose={importModal.onClose}
        onSuccess={fetchLeads}
        existingLeads={leads}
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

