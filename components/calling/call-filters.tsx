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
    <div className="p-3.5 bg-[#0c0c12] border border-white/[0.08] rounded-xl shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Input
            id="calls-search"
            placeholder="Search company, contact, or phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 text-xs bg-[#08080d] border-white/[0.08] focus:border-white/[0.2]"
          />

          <Select
            id="calls-filter-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={CALL_STATUS_OPTIONS}
            className="h-8 text-xs bg-[#08080d] border-white/[0.08]"
          />

          <Select
            id="calls-filter-objective"
            value={campaignId}
            onChange={(e) => onCampaignChange(e.target.value)}
            options={[
              { value: "", label: "All Objectives" },
              ...campaigns.map((c) => ({ value: c.id, label: c.name })),
            ]}
            className="h-8 text-xs bg-[#08080d] border-white/[0.08]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2.5 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            >
              Reset Filters
            </Button>
          )}
          {onPrepareClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={onPrepareClick}
              className="h-8 px-3.5 text-xs bg-white text-zinc-950 hover:bg-zinc-200 font-semibold shadow-xs flex items-center gap-1.5"
            >
              <span>+ Prepare AI Call</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
