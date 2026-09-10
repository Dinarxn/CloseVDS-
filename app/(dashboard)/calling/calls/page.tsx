"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
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
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Call Queue &amp; History"
          description="Supervise all queued, approved, in-progress, and completed AI voice outreach calls across the acquisition pipeline."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "AI Calling", href: "/calling" },
            { label: "Call Queue" },
          ]}
        />

        {errorMsg && (
          <Alert variant="destructive" title="Error">
            {errorMsg}
          </Alert>
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
          <div className="flex items-center justify-between py-2 text-xs text-zinc-400">
            <span>
              Showing {calls.length} of {totalCount} total calls
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
      </div>
    </PageContainer>
  );
}
