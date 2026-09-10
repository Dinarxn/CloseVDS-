import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export interface LeadsEmptyStateProps {
  onFindLeads?: () => void;
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function LeadsEmptyState({ onFindLeads, isFiltered, onClearFilters }: LeadsEmptyStateProps) {
  if (isFiltered) {
    return (
      <EmptyState
        title="No matching leads"
        description="No prospects match the active filter criteria. Try adjusting or resetting your filters."
        action={
          onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Reset filters
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <EmptyState
        title="No leads yet"
        description="Your discovered prospects will appear here once you initiate a lead discovery workflow."
        action={
          onFindLeads && (
            <Button variant="primary" size="md" onClick={onFindLeads}>
              Find leads
            </Button>
          )
        }
      />
      <div className="p-4 bg-[#171717] border border-[#404040]/50 rounded-lg text-center space-y-1.5 max-w-xl mx-auto">
        <p className="text-xs font-semibold text-white uppercase tracking-wider">
          Acquisition OS Lifecycle
        </p>
        <p className="text-xs text-[#737373] leading-relaxed">
          In future phases, the automated discovery engine will fetch candidate businesses, perform 4-factor deduplication, audit technical website gaps, and score relevance before queueing outreach drafts for your approval.
        </p>
      </div>
    </div>
  );
}
