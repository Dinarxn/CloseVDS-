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
import { api } from "@/lib/api-client";

export interface OutreachQueueTabsProps {
  drafts?: OutreachDraft[];
  onRefresh?: () => void;
}

export function OutreachQueueTabs({ drafts = [], onRefresh }: OutreachQueueTabsProps) {
  const [activeStage, setActiveStage] = useState<OutreachStage>("pending_approval");
  const [selectedDraft, setSelectedDraft] = useState<OutreachDraft | null>(null);
  const approvalDialog = useDisclosure({ defaultIsOpen: false });

  const handleOpenApproval = (draft: OutreachDraft) => {
    setSelectedDraft(draft);
    approvalDialog.onOpen();
  };

  const handleReject = async (draftId: string) => {
    try {
      await api.post(`/outreach/${draftId}/cancel`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to cancel draft:", err);
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
