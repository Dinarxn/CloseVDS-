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
    description: "AI-generated drafts awaiting operator review & explicit approval",
  },
  {
    key: "approved_queue",
    label: "Approved & Queued",
    count: 0,
    description: "Approved dispatches scheduled for delivery window",
  },
  {
    key: "sent_active",
    label: "Active Sequences",
    count: 0,
    description: "Touch 1 sent — awaiting reply or follow-up permission check",
  },
  {
    key: "suppressed",
    label: "Suppression & Opt-Outs",
    count: 0,
    description: "Permanently halted contacts and domains",
  },
];
