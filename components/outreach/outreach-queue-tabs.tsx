"use client";

import React, { useState } from "react";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { OutreachDraft, OutreachStage } from "@/types/outreach";
import { OUTREACH_QUEUE_TABS } from "./outreach-constants";
import { OutreachEmptyState } from "./outreach-empty-state";
import { PermissionReviewCard } from "./permission-review-card";
import { PermissionApprovalDialog } from "./permission-approval-dialog";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useToast } from "@/hooks/use-toast";
import { api, ApiClientError } from "@/lib/api-client";

export interface OutreachQueueTabsProps {
  drafts?: OutreachDraft[];
  onRefresh?: () => void;
}

export function OutreachQueueTabs({ drafts = [], onRefresh }: OutreachQueueTabsProps) {
  const [activeStage, setActiveStage] = useState<OutreachStage>("pending_approval");
  const [selectedDraft, setSelectedDraft] = useState<OutreachDraft | null>(null);
  const approvalDialog = useDisclosure({ defaultIsOpen: false });
  const { addToast } = useToast();

  const handleOpenApproval = (draft: OutreachDraft) => {
    setSelectedDraft(draft);
    approvalDialog.onOpen();
  };

  const handleReject = async (draftId: string) => {
    try {
      await api.outreach.reject(draftId);
      addToast({
        title: "Draft Rejected",
        description: "Outreach draft was rejected and removed from queue.",
        variant: "default",
      });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to reject outreach draft.";
      addToast({
        title: "Rejection Failed",
        description: msg,
        variant: "error",
      });
      console.error("Failed to reject draft:", err);
    }
  };

  const handleCancel = async (draftId: string) => {
    try {
      await api.outreach.cancel(draftId);
      addToast({
        title: "Dispatch Cancelled",
        description: "Outreach dispatch was cancelled.",
        variant: "default",
      });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to cancel outreach dispatch.";
      addToast({
        title: "Cancellation Failed",
        description: msg,
        variant: "error",
      });
      console.error("Failed to cancel draft:", err);
    }
  };

  const handleDispatch = async (draftId: string) => {
    try {
      await api.outreach.dispatch(draftId);
      addToast({
        title: "Outreach Dispatched",
        description: "Draft dispatched to provider successfully.",
        variant: "success",
      });
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : "Outbound dispatch failed. Please check provider credentials and safety gates.";
      addToast({
        title: "Dispatch Failed",
        description: msg,
        variant: "error",
      });
      console.error("Failed to dispatch draft:", err);
    }
  };

  const filteredDrafts = drafts.filter((d) => d.stage === activeStage);

  return (
    <div className="space-y-6">
      <Tabs
        value={activeStage}
        onValueChange={(val) => setActiveStage(val as OutreachStage)}
        defaultValue="pending_approval"
      >
        <TabList className="w-full">
          {OUTREACH_QUEUE_TABS.map((tab) => {
            const count = drafts.filter((d) => d.stage === tab.key).length;
            return (
              <Tab key={tab.key} value={tab.key}>
                <div className="flex items-center space-x-1.5">
                  <span>{tab.label}</span>
                  <Badge variant={count > 0 ? "solid" : "outline"} className="text-[10px] px-1.5 py-0">
                    {count}
                  </Badge>
                </div>
              </Tab>
            );
          })}
        </TabList>

        {OUTREACH_QUEUE_TABS.map((tab) => (
          <TabPanel key={tab.key} value={tab.key} className="space-y-4">
            <div className="text-xs text-[#737373] pb-2">
              {tab.description}
            </div>

            {filteredDrafts.length === 0 ? (
              <OutreachEmptyState stage={tab.key as OutreachStage} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDrafts.map((draft) => (
                  <PermissionReviewCard
                    key={draft.id}
                    draft={draft}
                    onApprove={handleOpenApproval}
                    onReject={handleReject}
                    onCancel={handleCancel}
                    onDispatch={handleDispatch}
                  />
                ))}
              </div>
            )}
          </TabPanel>
        ))}
      </Tabs>

      {/* Permission Gate Approval Modal */}
      <PermissionApprovalDialog
        isOpen={approvalDialog.isOpen}
        onClose={approvalDialog.onClose}
        draft={selectedDraft}
        onApproved={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
