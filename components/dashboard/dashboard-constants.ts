export interface LifecycleStage {
  stepNumber: number;
  title: string;
  description: string;
  statusTag: string;
  statusVariant: "default" | "secondary" | "success" | "warning" | "info" | "outline";
  route?: string;
}

export interface SafetyPrinciple {
  title: string;
  description: string;
  badge: string;
  status: string;
  route: string;
}

export interface PipelineStageConfig {
  id: string;
  label: string;
  description: string;
  statusKey?: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: "DISCOVERED", label: "Discovered", description: "closeBDS scrape or manual import" },
  { id: "RESEARCHED", label: "Researched", description: "Website audit & tech stack verified" },
  { id: "QUALIFIED", label: "Qualified", description: "ICP fit score threshold met" },
  { id: "CALL_READY", label: "Call Ready", description: "Context grounded & safety cleared" },
  { id: "CONTACTED", label: "Contacted", description: "Outbound AI call initiated" },
  { id: "INTERESTED", label: "Interested", description: "Positive prospect sentiment detected" },
  { id: "MEETING", label: "Meeting", description: "Calendar discovery booked" },
  { id: "WON", label: "Won", description: "Converted client in CRM" },
];

export const ACQUISITION_OPERATING_STAGES: LifecycleStage[] = [
  {
    stepNumber: 1,
    title: "Discover",
    description: "closeBDS automated discovery and multi-source prospect discovery.",
    statusTag: "Source Pending",
    statusVariant: "outline",
    route: "/leads",
  },
  {
    stepNumber: 2,
    title: "Research",
    description: "Deep website audit, tech stack analysis, and business deficit detection.",
    statusTag: "Available",
    statusVariant: "secondary",
    route: "/leads",
  },
  {
    stepNumber: 3,
    title: "Qualify",
    description: "Relevance evaluation and dual fact verification against ICP score.",
    statusTag: "Operational",
    statusVariant: "success",
    route: "/leads",
  },
  {
    stepNumber: 4,
    title: "Prepare",
    description: "Generate grounded contact briefing and objective for AI voice agent.",
    statusTag: "Available",
    statusVariant: "secondary",
    route: "/calling/calls",
  },
  {
    stepNumber: 5,
    title: "Approve",
    description: "Mandatory human-in-the-loop permission gate before any outbound dial.",
    statusTag: "Enforced",
    statusVariant: "warning",
    route: "/calling/calls",
  },
  {
    stepNumber: 6,
    title: "Contact",
    description: "AI calling agent execution with latency-optimized voice pipeline.",
    statusTag: "Configured",
    statusVariant: "info",
    route: "/calling",
  },
  {
    stepNumber: 7,
    title: "Follow Up",
    description: "Handle callback requests, voicemails, and post-call disposition tasks.",
    statusTag: "Available",
    statusVariant: "secondary",
    route: "/crm",
  },
  {
    stepNumber: 8,
    title: "Convert",
    description: "Progress interested leads through CRM pipeline from meeting to closed deal.",
    statusTag: "Operational",
    statusVariant: "success",
    route: "/crm",
  },
  {
    stepNumber: 9,
    title: "Analyze",
    description: "Telemetry on qualification rates, call dispositions, and acquisition ROI.",
    statusTag: "Operational",
    statusVariant: "success",
    route: "/analytics",
  },
];

export const SAFETY_GOVERNANCE_ITEMS: SafetyPrinciple[] = [
  {
    title: "Human-in-the-Loop",
    description: "Every outbound AI call requires explicit human approval before dialing.",
    badge: "100% Gated",
    status: "Enforced",
    route: "/calling/settings",
  },
  {
    title: "Phone Suppression",
    description: "National DNC, opt-outs, and previous disconnects automatically blocked.",
    badge: "Immutable DNC",
    status: "Active",
    route: "/settings",
  },
  {
    title: "AI Fact Grounding",
    description: "AI agent dialogue strictly bounded to verified audit data with zero hallucinations.",
    badge: "Anti-Hallucination",
    status: "Active",
    route: "/calling/settings",
  },
  {
    title: "Global Kill Switch",
    description: "Instant emergency disconnect halting all active and queued voice sessions.",
    badge: "Standby",
    status: "Armed",
    route: "/calling",
  },
  {
    title: "Provider Circuit Breaker",
    description: "Real-time error rate monitoring with automatic telephony provider fallback.",
    badge: "Fail-Safe",
    status: "Protected",
    route: "/calling/settings",
  },
];
