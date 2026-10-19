"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  OutreachOverviewCards,
  OutreachLeadSelector,
  OutreachComposer,
  OutreachActivityTimeline,
  OutreachIntroduction,
  OutreachQueueTabs,
} from "@/components/outreach";
import { api, ApiClientError } from "@/lib/api-client";
import {
  mapBackendOutreachToFrontend,
  mapBackendLeadToFrontend,
  type BackendEmailMessage,
} from "@/lib/mappers";
import type { OutreachDraft, OutreachOverviewStats } from "@/types/outreach";
import type { Lead } from "@/types/leads";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function OutreachPage() {
  const [activeMainTab, setActiveMainTab] = useState<"hub" | "queue">("hub");

  // Outreach Drafts Queue State
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [draftsError, setDraftsError] = useState<string | null>(null);

  // Leads Directory State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filters & Pagination for Leads
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Synchronized trigger for timeline / drafts update
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Outreach Drafts from backend
  const fetchDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    setDraftsError(null);
    try {
      const response = await api.outreach.list();
      const raw = response?.data || response?.items;
      let items: BackendEmailMessage[] = [];
      if (Array.isArray(raw)) {
        items = raw;
      } else if (raw && typeof raw === "object" && "items" in raw && Array.isArray((raw as { items: unknown[] }).items)) {
        items = (raw as { items: BackendEmailMessage[] }).items;
      }

      setDrafts(items.map(mapBackendOutreachToFrontend));
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 503 || err.code === "DATABASE_UNAVAILABLE") {
          setDraftsError("Cannot connect to database. PostgreSQL connection unavailable.");
        } else if (err.statusCode === 401) {
          setDraftsError("Session expired. Please log in again.");
        } else {
          setDraftsError(err.message || "Failed to load outreach drafts.");
        }
      } else {
        setDraftsError("Failed to communicate with outreach service.");
      }
      setDrafts([]);
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  // Fetch Leads for Outreach Selector
  const fetchLeads = useCallback(async () => {
    setIsLoadingLeads(true);
    setLeadsError(null);
    try {
      const response = await api.leads.list({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter ? statusFilter.toUpperCase() : undefined,
        page,
        limit: 12,
      });

      const rawItems = Array.isArray(response?.data) ? response.data : [];
      const mapped = rawItems.map(mapBackendLeadToFrontend);
      setLeads(mapped);

      const respTotal = typeof response?.total === "number" ? response.total : rawItems.length;
      setTotalLeads(respTotal);
      setTotalPages(
        typeof response?.totalPages === "number" && response.totalPages > 0
          ? response.totalPages
          : Math.max(1, Math.ceil(respTotal / 12))
      );

      // Auto-select first lead if none selected and items exist
      setSelectedLead((prev) => {
        if (prev && mapped.some((l) => l.id === prev.id)) {
          return mapped.find((l) => l.id === prev.id) || prev;
        }
        return mapped.length > 0 ? mapped[0] : null;
      });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setLeadsError(err.message || "Failed to load leads from workspace.");
      } else {
        setLeadsError("Unable to connect to lead service.");
      }
      setLeads([]);
      setTotalLeads(0);
      setTotalPages(1);
    } finally {
      setIsLoadingLeads(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Real Calculated Overview Metrics
  const overviewStats: OutreachOverviewStats = useMemo(() => {
    const pendingApproval = drafts.filter((d) => d.stage === "pending_approval").length;
    const approvedQueue = drafts.filter((d) => d.stage === "approved_queue").length;
    const sentActive = drafts.filter((d) => d.stage === "sent_active").length;
    const suppressed = drafts.filter((d) => d.stage === "suppressed").length;

    return {
      totalDrafts: drafts.length,
      pendingApproval,
      approvedQueue,
      sentActive,
      suppressed,
      qualifiedLeadsCount: totalLeads,
    };
  }, [drafts, totalLeads]);

  const handleActivityLogged = () => {
    setActivityRefreshKey((prev) => prev + 1);
    fetchLeads();
  };

  const handleDraftCreated = () => {
    fetchDrafts();
    setActivityRefreshKey((prev) => prev + 1);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header with Title and Mode Badging */}
        <PageHeader
          title="Outreach"
          description="Permission-gated multi-channel outreach, personalized message composer, and verified CRM activity tracking."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Outreach" },
          ]}
          action={
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-mono border-white/20 text-zinc-300">
                Permission Gated · Zero-Spam
              </Badge>
            </div>
          }
        />

        {/* Real Overview KPI Metrics */}
        <OutreachOverviewCards stats={overviewStats} isLoading={isLoadingDrafts} />

        {/* Error Alert if Drafts or Leads failed */}
        {(draftsError || leadsError) && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{draftsError || leadsError}</span>
            </div>
            <button
              onClick={() => {
                fetchDrafts();
                fetchLeads();
              }}
              className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Primary Workspace Tabs: Action Hub vs Permission Queue */}
        <Tabs
          value={activeMainTab}
          onValueChange={(val) => setActiveMainTab(val as "hub" | "queue")}
          defaultValue="hub"
        >
          <TabList className="w-full sm:w-auto">
            <Tab value="hub">
              <div className="flex items-center gap-2">
                <span>Lead Outreach Hub</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.08] px-1.5 py-0.2 rounded">
                  Compose &amp; Engage
                </span>
              </div>
            </Tab>
            <Tab value="queue">
              <div className="flex items-center gap-2">
                <span>Permission Review Queue</span>
                <Badge variant={overviewStats.pendingApproval > 0 ? "solid" : "outline"} className="text-[10px] px-1.5 py-0">
                  {overviewStats.pendingApproval}
                </Badge>
              </div>
            </Tab>
          </TabList>

          {/* TAB 1: LEAD OUTREACH ACTION HUB */}
          <TabPanel value="hub" className="space-y-4 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: Lead Selector Directory (5 cols) */}
              <div className="lg:col-span-5 h-[720px]">
                <OutreachLeadSelector
                  leads={leads}
                  selectedLeadId={selectedLead?.id || null}
                  onSelectLead={(l) => setSelectedLead(l)}
                  isLoading={isLoadingLeads}
                  search={search}
                  onSearchChange={setSearch}
                  statusFilter={statusFilter}
                  onStatusFilterChange={(st) => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  page={page}
                  totalPages={totalPages}
                  totalLeads={totalLeads}
                  onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                  onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </div>

              {/* Right Column: Multi-Channel Composer & Lead Activity Timeline (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <OutreachComposer
                  lead={selectedLead}
                  onActivityLogged={handleActivityLogged}
                  onDraftCreated={handleDraftCreated}
                />

                <OutreachActivityTimeline
                  leadId={selectedLead?.id || null}
                  refreshTrigger={activityRefreshKey}
                />
              </div>
            </div>
          </TabPanel>

          {/* TAB 2: PERMISSION REVIEW QUEUE & DRAFTS */}
          <TabPanel value="queue" className="space-y-6 pt-2">
            {/* 4-Gate Safety Documentation Card */}
            <OutreachIntroduction />

            {/* Queue Management Interface */}
            {isLoadingDrafts ? (
              <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#121216]">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-400">Loading outreach drafts from workspace...</p>
              </div>
            ) : (
              <OutreachQueueTabs drafts={drafts} onRefresh={fetchDrafts} />
            )}
          </TabPanel>
        </Tabs>
      </div>
    </PageContainer>
  );
}
