import React from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { OutreachStage } from "@/types/outreach";

export interface OutreachEmptyStateProps {
  stage: OutreachStage;
}

export function OutreachEmptyState({ stage }: OutreachEmptyStateProps) {
  const contentMap: Record<OutreachStage, { title: string; description: string }> = {
    pending_approval: {
      title: "No drafts pending review",
      description: "Once lead discovery and qualification workflows complete, AI-generated outreach drafts will appear here for your review and explicit permission.",
    },
    approved_queue: {
      title: "Queue is empty",
      description: "Drafts that you explicitly approve will move here before being dispatched within configured delivery velocity windows.",
    },
    sent_active: {
      title: "No active sequences",
      description: "Dispatched initial touches will be tracked here. If no reply is detected after the delay interval, the follow-up draft will be queued for your approval.",
    },
    suppressed: {
      title: "Suppression list is clean",
      description: "Prospects who unsubscribe or are flagged on hard bounces will be automatically recorded here to prevent future communications.",
    },
  };

  const { title, description } = contentMap[stage];

  return (
    <div className="space-y-4">
      <EmptyState
        title={title}
        description={description}
      />
    </div>
  );
}
