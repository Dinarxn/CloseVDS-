import React from "react";
import { EmptyState } from "@/components/ui/empty-state";

export function AnalyticsEmptyState() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Zero Acquisition Records"
        description="Analytics metrics, conversion rates, and pipeline performance charts will populate automatically once real lead discovery and permission-gated outreach workflows are executed."
      />
    </div>
  );
}
