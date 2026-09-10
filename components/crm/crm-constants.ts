import { CrmStageConfig } from "@/types/crm";

export const CRM_STAGES: CrmStageConfig[] = [
  {
    id: "discovered",
    label: "Discovered",
    description: "Raw candidate businesses fetched from discovery providers",
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
    description: "Initial message dispatched via verified domain",
  },
  {
    id: "in_followup",
    label: "In Follow-up",
    description: "Scheduled for touch 2 or 3 follow-up review",
  },
  {
    id: "meeting_booked",
    label: "Meeting Booked",
    description: "Positive reply received & discovery call scheduled",
  },
  {
    id: "closed_won",
    label: "Closed Won",
    description: "Contract finalized & client successfully acquired",
    isTerminal: true,
  },
];
