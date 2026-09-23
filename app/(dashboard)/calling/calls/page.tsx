"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  CallsTable,
  CallFilters,
  CallPreparationModal,
  CallSafetyModal,
  CallDispatchModal,
  CallRejectModal,
} from "@/components/calling";
import { CallWithRelations, CallStatus } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallWithRelations[]>([]);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; name: string }>>([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [safetyModalCallId, setSafetyModalCallId] = useState<string | null>(null);
  const [dispatchModalCall, setDispatchModalCall] = useState<CallWithRelations | null>(null);
  const [rejectingCall, setRejectingCall] = useState<CallWithRelations | null>(null);
  const [providerConfigured, setProviderConfigured] = useState(false);

  const { addToast } = useToast();

  // Load campaigns & provider status
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cRes, pRes] = await Promise.allSettled([
          api.get<{ items?: Array<{ id: string; name: string }>; data?: { items?: Array<{ id: string; name: string }> } }>("/campaigns"),
          api.settings.getProviders(),
        ]);

        if (cRes.status === "fulfilled") {
          const items = cRes.value?.items || cRes.value?.data?.items;
          if (items) {
            setCampaigns(items);
          }
        }

        if (pRes.status === "fulfilled" && pRes.value?.providers) {
          const twilio = pRes.value.providers.find((p) => p.provider.toLowerCase().includes("twilio"));
          setProviderConfigured(Boolean(twilio?.isConfigured));
        }
      } catch (err) {
        console.error("Failed to load call metadata:", err);
      }
    };

    loadMetadata();
  }, []);

  const fetchCalls = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.voice.listCalls({
        search: search.trim() || undefined,
        status: status ? (status as CallStatus) : undefined,
        campaignId: campaignId || undefined,
        page,
        limit: 20,
      });

      if (res?.data) {
        setCalls(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to load calls from server.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, status, campaignId, page]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setCampaignId("");
    setPage(1);
  };

  const handleApprove = async (call: CallWithRelations) => {
    try {
      await api.voice.approveCall(call.id);
      addToast({
        title: "Call Approved",
        description: `Call for ${call.lead?.businessName || call.normalizedPhone} approved for dispatch.`,
        variant: "success",
      });
      fetchCalls();
    } catch (err: unknown) {
      addToast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Approval failed",
        variant: "error",
      });
    }
  };

  const handleConfirmReject = async (reason?: string) => {
    if (!rejectingCall) return;
    try {
      await api.voice.rejectCall(rejectingCall.id, reason);
      addToast({
        title: "Call Rejected",
        description: "Call disqualified and removed from outbound queue.",
        variant: "warning",
      });
      setRejectingCall(null);
      fetchCalls();
    } catch (err: unknown) {
      addToast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : "Rejection failed",
        variant: "error",
      });
    }
  };

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      <PageHeader
        title="Call Queue &amp; History"
        description="Supervise all queued, approved, in-progress, and completed AI voice outreach calls across the acquisition pipeline."
        breadcrumbs={[
          { label: "closeVDS", href: "/dashboard" },
          { label: "AI Calling", href: "/calling" },
          { label: "Call Queue" },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link href="/calling">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 text-xs bg-[#101017] hover:bg-[#161622] text-zinc-200 border-white/[0.08] hover:border-white/[0.16] shadow-xs flex items-center gap-1.5"
              >
                <span>AI Calling Hub</span>
              </Button>
            </Link>
          </div>
        }
      />

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-[#140f09] border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90 shadow-xs">
          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="space-y-0.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-medium block">
              Call Queue Notice
            </span>
            <p className="text-amber-200/80 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <CallFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        campaignId={campaignId}
        onCampaignChange={(val) => {
          setCampaignId(val);
          setPage(1);
        }}
        campaigns={campaigns}
        onReset={handleResetFilters}
        onPrepareClick={() => setIsPrepModalOpen(true)}
      />

      {/* Calls Table */}
      <CallsTable
        calls={calls}
        isLoading={isLoading}
        onApprove={handleApprove}
        onReject={(call) => setRejectingCall(call)}
        onCheckSafety={(call) => setSafetyModalCallId(call.id)}
        onDispatch={(call) => setDispatchModalCall(call)}
        onPrepareClick={() => setIsPrepModalOpen(true)}
      />

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a10] border border-white/[0.07] text-xs text-zinc-400 shadow-xs">
          <span>
            Showing <span className="font-mono text-white">{calls.length}</span> of{" "}
            <span className="font-mono text-white">{totalCount}</span> total calls
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 text-xs bg-white/[0.04] border-white/[0.08]"
            >
              Previous
            </Button>
            <span className="font-mono text-white px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 text-xs bg-white/[0.04] border-white/[0.08]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

        {/* Modals */}
        <CallPreparationModal
          isOpen={isPrepModalOpen}
          onClose={() => setIsPrepModalOpen(false)}
          onCallCreated={() => {
            fetchCalls();
          }}
        />

        <CallSafetyModal
          isOpen={Boolean(safetyModalCallId)}
          callId={safetyModalCallId || ""}
          onClose={() => setSafetyModalCallId(null)}
        />

        <CallDispatchModal
          isOpen={Boolean(dispatchModalCall)}
          call={dispatchModalCall}
          providerConfigured={providerConfigured}
          onClose={() => setDispatchModalCall(null)}
          onDispatched={() => {
            fetchCalls();
          }}
        />

        <CallRejectModal
          isOpen={Boolean(rejectingCall)}
          leadName={rejectingCall?.lead?.businessName}
          onClose={() => setRejectingCall(null)}
          onConfirm={handleConfirmReject}
        />
    </PageContainer>
  );
}
