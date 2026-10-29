/**
 * closeVDS Outreach UX Foundation Constants
 * Phase 1 — Step 8
 */

export interface QueueTabConfig {
  key: string;
  label: string;
  count: number;
  description: string;
}

export const OUTREACH_QUEUE_TABS: QueueTabConfig[] = [
  {
    key: "pending_approval",
    label: "Pending Review",
    count: 0,
    description: "Gate 2: AI-generated drafts awaiting operator review & explicit approval",
  },
  {
    key: "approved_queue",
    label: "Scheduled & Approved",
    count: 0,
    description: "Gate 3: Approved dispatches scheduled for controlled delivery window",
  },
  {
    key: "sent_active",
    label: "Sent & Active",
    count: 0,
    description: "Touch 1 dispatched — awaiting reply or follow-up permission check",
  },
  {
    key: "suppressed",
    label: "Failed & Suppressed",
    count: 0,
    description: "Permanently halted contacts, regulatory opt-outs, and delivery failures",
  },
];
