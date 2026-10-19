"use client";

import React from "react";
import Link from "next/link";
import { CallWithRelations } from "@/types/calling";
import { CallStatusBadge } from "./call-status-badge";
import { CallOutcomeBadge } from "./call-outcome-badge";
import { Button } from "@/components/ui/button";
import { formatCallDuration, formatCallDateTime } from "@/lib/mappers";

export interface CallsTableProps {
  calls: CallWithRelations[];
  isLoading?: boolean;
  onApprove?: (call: CallWithRelations) => void;
  onReject?: (call: CallWithRelations) => void;
  onCancel?: (call: CallWithRelations) => void;
  onCheckSafety?: (call: CallWithRelations) => void;
  onDispatch?: (call: CallWithRelations) => void;
  onPrepareClick?: () => void;
}

export function CallsTable({
  calls,
  isLoading = false,
  onApprove,
  onReject,
  onCancel,
  onCheckSafety,
  onDispatch,
  onPrepareClick,
}: CallsTableProps) {
  if (isLoading) {
    return (
      <div className="border border-white/[0.08] rounded-xl bg-[#0c0c12] p-12 text-center space-y-3 shadow-xs">
        <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">Loading call queue from workspace...</p>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="relative overflow-hidden border border-white/[0.08] rounded-xl bg-[#09090f]/90 p-8 sm:p-12 text-center space-y-3.5 shadow-xs">
        {/* Hairline reflection */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none" />

        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
          <svg className="w-4.5 h-4.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium block">
            Call Queue Telemetry
          </span>
          <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">No calls found</h4>
        </div>

        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
          No calls match your active filter criteria or no calls have been prepared yet.
        </p>

        {onPrepareClick && (
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPrepareClick}
              className="text-xs h-8 px-3.5 bg-white/[0.08] hover:bg-white/[0.14] text-white border-white/[0.1] hover:border-white/[0.2] shadow-xs inline-flex items-center gap-1.5"
            >
              <span>+ Prepare New AI Call</span>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#0c0c12] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#08080d] text-zinc-400 uppercase tracking-wider font-mono text-[10px]">
              <th className="py-3 px-4">Prospect &amp; Company</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Voice Agent &amp; Objective</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Outcome</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-white">
            {calls.map((call) => {
              const isApprovalRequired = call.status === "APPROVAL_REQUIRED";
              const isApproved = call.status === "APPROVED";

              return (
                <tr
                  key={call.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4 font-medium">
                    <Link
                      href={`/calling/calls/${call.id}`}
                      className="hover:underline hover:text-white"
                    >
                      <div className="font-semibold text-white">{call.lead?.businessName || "Unnamed Lead"}</div>
                    </Link>
                    <div className="text-[11px] text-zinc-400">
                      {call.contact?.fullName || "Primary Contact"}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-zinc-300">
                    {call.normalizedPhone || call.recipientPhone}
                  </td>

                  <td className="py-3 px-4 text-zinc-300">
                    <div className="font-medium text-white">{call.agentConfig?.name || "AI Voice Agent"}</div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-[180px]">
                      {call.campaign?.targetOffer || "Client Acquisition"}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <CallStatusBadge status={call.status} size="sm" />
                  </td>

                  <td className="py-3 px-4">
                    <CallOutcomeBadge outcome={call.outcome?.outcome} size="sm" />
                  </td>

                  <td className="py-3 px-4 font-mono tabular-nums text-zinc-400">
                    {formatCallDuration(call.durationSeconds)}
                  </td>

                  <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                    {formatCallDateTime(call.createdAt)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isApprovalRequired && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium shadow-none"
                            onClick={() => onApprove?.(call)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                            onClick={() => onReject?.(call)}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {isApproved && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] h-7 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                            onClick={() => onDispatch?.(call)}
                          >
                            Dispatch
                          </Button>
                          {onCancel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[11px] h-7 px-2 text-zinc-400 hover:text-rose-400"
                              onClick={() => onCancel(call)}
                              title="Cancel approved call before dialing"
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-7 px-2 text-zinc-400 hover:text-white"
                        onClick={() => onCheckSafety?.(call)}
                        title="Evaluate 18 server safety gates"
                      >
                        Safety
                      </Button>

                      <Link href={`/calling/calls/${call.id}`}>
                        <Button variant="outline" size="sm" className="text-[11px] h-7 px-2 border-white/[0.08] hover:border-white/[0.2]">
                          View
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
