import { CrmStageConfig } from "@/types/crm";

export const CRM_STAGES: CrmStageConfig[] = [
  {
    id: "discovered",
    label: "Lead / Discovered",
    description: "Raw candidate businesses identified via discovery providers",
  },
  {
    id: "qualified",
    label: "Qualified",
    description: "Audited & scored >= threshold (Opportunity identified)",
  },
  {
    id: "outreach_approved",
    label: "Outreach Approved",
    description: "Draft reviewed and explicitly authorized by operator",
  },
  {
    id: "contacted",
    label: "Contacted",
    description: "Initial message dispatched via verified domain or voice",
  },
  {
    id: "in_followup",
    label: "In Follow-up",
    description: "Scheduled for touch 2 or touch 3 nurturing review",
  },
  {
    id: "meeting_booked",
    label: "Meeting Booked",
    description: "Positive reply received & discovery call confirmed",
  },
  {
    id: "closed_won",
    label: "Closed Won",
    description: "Contract finalized & revenue successfully acquired",
    isTerminal: true,
  },
  {
    id: "closed_lost",
    label: "Closed Lost",
    description: "Disqualified, declined, or opted-out prospects",
    isTerminal: true,
  },
];
