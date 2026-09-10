import { AcquisitionKpis, FunnelStageMetric } from "@/types/analytics";

export const INITIAL_ZERO_KPIS: AcquisitionKpis = {
  leadsDiscovered: 0,
  qualificationRate: 0,
  approvedDispatches: 0,
  replyRate: 0,
  meetingsBooked: 0,
  clientsClosed: 0,
};

export const ACQUISITION_FUNNEL_STAGES: FunnelStageMetric[] = [
  {
    stageId: "discovered",
    stageLabel: "1. Discovered",
    count: 0,
    conversionRateFromPrevious: 100,
    description: "Raw businesses identified via discovery providers",
  },
  {
    stageId: "qualified",
    stageLabel: "2. Qualified",
    count: 0,
    conversionRateFromPrevious: 0,
    description: "Passed gap audit & opportunity score threshold",
  },
  {
    stageId: "approved",
    stageLabel: "3. Approved",
    count: 0,
    conversionRateFromPrevious: 0,
    description: "Personalized copy approved by operator",
  },
  {
    stageId: "dispatched",
    stageLabel: "4. Dispatched",
    count: 0,
    conversionRateFromPrevious: 0,
    description: "Sent via authenticated domain",
  },
  {
    stageId: "replied",
    stageLabel: "5. Replied",
    count: 0,
    conversionRateFromPrevious: 0,
    description: "Positive response received",
  },
  {
    stageId: "meeting_booked",
    stageLabel: "6. Meeting Booked",
    count: 0,
    conversionRateFromPrevious: 0,
    description: "Discovery call scheduled",
  },
  {
    stageId: "closed_won",
    stageLabel: "7. Client Closed",
    count: 0,
    conversionRateFromPrevious: 0,
    description: "Contract signed & won",
  },
];
