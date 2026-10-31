"use client";

import React, { useState } from "react";
import { N8nWebhookDelivery } from "@/types/calling";
import { formatCallDateTime } from "@/lib/mappers";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";

export interface N8nDeliveriesTableProps {
  deliveries: N8nWebhookDelivery[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function N8nDeliveriesTable({
  deliveries = [],
  isLoading = false,
  onRefresh,
}: N8nDeliveriesTableProps) {
  const [previewDelivery, setPreviewDelivery] = useState<N8nWebhookDelivery | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleRetry = async (delivery: N8nWebhookDelivery) => {
    setRetryingId(delivery.id);
    try {
      const res = await api.n8n.retryDelivery(delivery.id);
      addToast({
        title: res.data.status === "DELIVERED" ? "Delivery Succeeded" : "Retry Attempted",
        description: `Webhook retry completed with status ${res.data.status} (HTTP ${res.data.statusCode || 0}).`,
        variant: res.data.status === "DELIVERED" ? "success" : "warning",
      });
      onRefresh?.();
    } catch (err: unknown) {
      addToast({
        title: "Retry Failed",
        description: err instanceof Error ? err.message : "Network error during delivery retry",
        variant: "error",
      });
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <>
      <div className="relative rounded-xl border border-white/[0.08] bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                Dispatch Audit Stream
              </span>
              <span className="text-zinc-600 font-mono text-[10px]">•</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                HMAC-SHA256 Signed
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Outbound Webhook Delivery Log
            </h3>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed font-sans">
              Real-time audit history of events dispatched to registered n8n webhook targets. Payload previews, signature headers, and manual retries available.
            </p>
          </div>

          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7.5 px-2.5 text-xs font-mono text-zinc-300 border-white/[0.08] hover:border-white/[0.16] self-start sm:self-auto shrink-0"
            >
              Refresh Log
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono text-zinc-400">Loading webhook deliveries...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="relative p-8 sm:p-10 text-center border border-white/[0.07] rounded-xl bg-surface-panel space-y-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
                  Webhook Audit Log
                </span>
                <h4 className="text-sm font-semibold text-white tracking-tight">
                  No outbound deliveries recorded yet
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
                  When calls complete or outcomes are classified, signed events will be dispatched to configured endpoints.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-white/[0.08] rounded-xl overflow-x-auto bg-surface-panel shadow-xs">
              <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-surface-panel/90 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">HTTP Code</th>
                    <th className="py-3 px-4">Tries</th>
                    <th className="py-3 px-4">Dispatched</th>
                    <th className="py-3 px-4">Error</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {deliveries.map((d) => {
                    const isDelivered = d.status === "DELIVERED";
                    const isFailed = d.status === "FAILED";
                    const isRetrying = retryingId === d.id;

                    return (
                      <tr key={d.id} className="hover:bg-violet-950/15 transition-colors">
                        <td className="py-3 px-4 font-mono text-zinc-300 text-xs select-all">
                          {d.eventId}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">
                          <span className="font-mono text-xs">{d.eventType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                              isDelivered
                                ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/25 font-semibold"
                                : isFailed
                                ? "bg-rose-500/10 text-rose-300 border-rose-500/25"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/25"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isDelivered
                                  ? "bg-[#C6FF33]"
                                  : isFailed
                                  ? "bg-rose-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {d.statusCode ? (
                            <span
                              className={`font-semibold ${
                                d.statusCode >= 200 && d.statusCode < 300
                                  ? "text-[#C6FF33]"
                                  : "text-rose-400"
                              }`}
                            >
                              {d.statusCode}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {d.attempts}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                          {formatCallDateTime(d.deliveredAt || d.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-xs truncate font-mono text-[11px]">
                          {d.lastError || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewDelivery(d)}
                              className="h-7 px-2 text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-surface-elevated"
                            >
                              Payload
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRetry(d)}
                              disabled={isRetrying}
                              className="h-7 px-2 text-[11px] font-mono text-violet-400 hover:text-violet-300 bg-surface-elevated border-white/[0.08]"
                            >
                              {isRetrying ? "Retrying..." : "Retry"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payload Preview Modal */}
      <Dialog
        open={Boolean(previewDelivery)}
        onOpenChange={(open) => !open && setPreviewDelivery(null)}
        title={`Webhook Event Payload: ${previewDelivery?.eventType || "Event"}`}
        description={`Delivered event ${previewDelivery?.eventId || ""} with HMAC-SHA256 signature.`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-lg bg-surface-panel border border-white/[0.06]">
            <div>
              <span className="text-zinc-500 block">Event ID:</span>
              <span className="text-white select-all">{previewDelivery?.eventId}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Status / Code:</span>
              <span className="text-[#C6FF33] font-semibold">{previewDelivery?.status} (HTTP {previewDelivery?.statusCode || "—"})</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Event Type:</span>
              <span className="text-zinc-300">{previewDelivery?.eventType}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Dispatch Time:</span>
              <span className="text-zinc-300">{previewDelivery?.deliveredAt || previewDelivery?.createdAt ? formatCallDateTime(previewDelivery?.deliveredAt || previewDelivery?.createdAt) : "—"}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-white block">
              Cryptographic Payload (JSON)
            </span>
            <div className="max-h-64 overflow-y-auto p-3 rounded-lg bg-[#000000] border border-white/[0.08] font-mono text-[11px] text-zinc-200 select-all leading-relaxed whitespace-pre-wrap">
              {previewDelivery?.payload ? JSON.stringify(previewDelivery.payload, null, 2) : "{}"}
            </div>
          </div>

          {previewDelivery?.lastError && (
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/25 text-xs text-rose-300 space-y-1">
              <span className="font-semibold block font-mono text-[11px] uppercase tracking-wider">
                Last Recorded Delivery Error
              </span>
              <p className="font-mono text-[11px] leading-relaxed break-words">{previewDelivery.lastError}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
            <Button
              variant="secondary"
              onClick={() => setPreviewDelivery(null)}
              className="border-white/[0.08]"
            >
              Close
            </Button>
            {previewDelivery && (
              <Button
                variant="primary"
                onClick={() => {
                  const d = previewDelivery;
                  setPreviewDelivery(null);
                  handleRetry(d);
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold"
              >
                Retry Delivery Now
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}