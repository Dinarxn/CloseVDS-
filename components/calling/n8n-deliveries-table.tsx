"use client";

import React from "react";
import { N8nWebhookDelivery } from "@/types/calling";
import { formatCallDateTime } from "@/lib/mappers";

export interface N8nDeliveriesTableProps {
  deliveries: N8nWebhookDelivery[];
  isLoading?: boolean;
}

export function N8nDeliveriesTable({
  deliveries = [],
  isLoading = false,
}: N8nDeliveriesTableProps) {
  return (
    <div className="relative rounded-xl border border-white/[0.08] bg-[#0c0c12]/90 shadow-xs overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
              Dispatch Audit Stream
            </span>
            <span className="text-zinc-600 font-mono text-[10px]">•</span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
              HMAC-SHA256 Signed
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Outbound Webhook Delivery Log
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Real-time audit history of events dispatched to registered n8n webhook targets. Secrets are never exposed.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-zinc-400">Loading webhook deliveries...</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="relative p-8 sm:p-10 text-center border border-white/[0.07] rounded-lg bg-[#09090f]/80 space-y-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
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
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                When calls complete or outcomes are classified, signed events will be dispatched to configured endpoints.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-white/[0.07] rounded-lg overflow-x-auto bg-[#09090f]/70">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.06] bg-[#0c0c14]/90 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HTTP Code</th>
                  <th className="py-3 px-4">Tries</th>
                  <th className="py-3 px-4">Dispatched</th>
                  <th className="py-3 px-4">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {deliveries.map((d) => {
                  const isDelivered = d.status === "DELIVERED";
                  const isFailed = d.status === "FAILED";

                  return (
                    <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                        {d.eventId}
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-200">
                        {d.eventType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                            isDelivered
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : isFailed
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isDelivered
                                ? "bg-emerald-400"
                                : isFailed
                                ? "bg-rose-500"
                                : "bg-amber-400 animate-pulse"
                            }`}
                          />
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                        {d.statusCode || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400 text-xs">
                        {d.attempts}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {formatCallDateTime(d.deliveredAt || d.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-xs text-rose-400 max-w-xs truncate">
                        {d.lastError || "—"}
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
  );
}
