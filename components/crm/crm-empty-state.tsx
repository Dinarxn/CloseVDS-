import React from "react";
import { EmptyState } from "@/components/ui/empty-state";

export function CrmEmptyState() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="CRM Pipeline is empty"
        description="Leads will automatically populate and progress through these stages as they are discovered, qualified, approved, and contacted."
      />
    </div>
  );
}
