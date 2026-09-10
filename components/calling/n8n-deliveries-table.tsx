"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
    <Card variant="standard">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Outbound Webhook Delivery Log</CardTitle>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#171717] text-[#a3a3a3] border border-[#404040]">
            HMAC-SHA256 Signed
          </span>
        </div>
        <CardDescription>
          Real-time audit history of events dispatched to registered n8n webhook targets. Secrets are never exposed.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#737373]">
            Loading webhook deliveries...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#737373] bg-[#0a0a0a] rounded-lg border border-[#404040]/50 space-y-1">
            <p className="font-semibold text-white">No outbound deliveries recorded yet</p>
            <p className="text-[#525252]">
              When calls complete or outcomes are classified, signed events will be dispatched to configured endpoints.
            </p>
          </div>
        ) : (
          <div className="border border-[#404040] rounded-lg overflow-hidden bg-[#0a0a0a]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#404040] bg-[#171717] text-[#737373] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">HTTP Code</th>
                  <th className="py-3 px-4">Tries</th>
                  <th className="py-3 px-4">Dispatched</th>
                  <th className="py-3 px-4">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#404040]/50 text-white">
                {deliveries.map((d) => {
                  const isDelivered = d.status === "DELIVERED";
                  const isFailed = d.status === "FAILED";

                  return (
                    <tr key={d.id} className="hover:bg-[#171717]/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">
                        {d.eventId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {d.eventType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isDelivered
                              ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                              : isFailed
                              ? "bg-rose-950/40 text-rose-300 border border-rose-800"
                              : "bg-amber-950/40 text-amber-300 border border-amber-800"
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
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">
                        {d.statusCode || "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">
                        {d.attempts}
                      </td>
                      <td className="py-3 px-4 text-[#737373]">
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
      </CardContent>
    </Card>
  );
}
