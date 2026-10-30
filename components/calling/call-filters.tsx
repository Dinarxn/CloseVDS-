"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface CallFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  campaignId: string;
  onCampaignChange: (val: string) => void;
  campaigns: Array<{ id: string; name: string }>;
  onReset: () => void;
  onPrepareClick?: () => void;
}

const CALL_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All Statuses" },
  { value: "APPROVAL_REQUIRED", label: "Approval Required (Review Queue)" },
  { value: "APPROVED", label: "Approved (Ready for Dispatch)" },
  { value: "QUEUED", label: "Queued" },
  { value: "SAFETY_CHECKING", label: "Safety Checking" },
  { value: "INITIATING", label: "Initiating" },
  { value: "RINGING", label: "Ringing" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "BLOCKED", label: "Safety Blocked" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_ANSWER", label: "No Answer" },
  { value: "BUSY", label: "Busy" },
  { value: "VOICEMAIL", label: "Voicemail" },
  { value: "OPTED_OUT", label: "Opted Out" },
];

export function CallFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  campaignId,
  onCampaignChange,
  campaigns,
  onReset,
  onPrepareClick,
}: CallFiltersProps) {
  const hasActiveFilters = Boolean(search.trim() || status || campaignId);

  return (
    <div className="p-4 bg-surface-card border border-white/[0.08] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Top specular hairline */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Input
            id="calls-search"
            placeholder="Search company, contact, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8.5 text-xs bg-surface-panel border-white/[0.08] focus:border-violet-500/50"
          />

          <Select
            id="calls-filter-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={CALL_STATUS_OPTIONS}
            className="h-8.5 text-xs bg-surface-panel border-white/[0.08]"
          />

          <Select
            id="calls-filter-objective"
            value={campaignId}
            onChange={(e) => onCampaignChange(e.target.value)}
            options={[
              { value: "", label: "All Objectives" },
              ...campaigns.map((c) => ({ value: c.id, label: c.name })),
            ]}
            className="h-8.5 text-xs bg-surface-panel border-white/[0.08]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs h-8.5 px-3 text-zinc-400 hover:text-white hover:bg-surface-elevated font-mono"
            >
              Reset Filters
            </Button>
          )}

          {onPrepareClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={onPrepareClick}
              className="text-xs h-8.5 px-3.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-xs"
            >
              + Prepare AI Call
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
