import React from "react";

interface PipelineStage {
  number: string;
  title: string;
  badge: string;
  description: string;
  mechanisms: string[];
  output: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    number: "01",
    title: "Prospect Discovery & Ingestion",
    badge: "Continuous Crawl",
    description:
      "Automated discovery engine that identifies high-fit ICP accounts across verified databases, web footprints, and corporate registries. Deduplicates in real-time.",
    mechanisms: [
      "Deterministic ICP boundary filtering",
      "Corporate domain & DNS verification",
      "Automated CSV import with duplicate reconciliation",
      "Key decision-maker contact graph enrichment",
    ],
    output: "Clean, verified prospect records with 0 duplicate contamination.",
  },
  {
    number: "02",
    title: "Deep Opportunity & Fact Auditing",
    badge: "Deterministic AI",
    description:
      "Synthesizes target account pain points by auditing website technology stacks, job postings, and public digital assets. Zero hallucinated claims.",
    mechanisms: [
      "Web stack and framework telemetry detection",
      "Pain point scoring based on empirical findings",
      "Verified executive hooks extracted directly from source text",
      "Automated qualification scoring & fit categorization",
    ],
    output: "Audited account brief with verifiable personalization citations.",
  },
  {
    number: "03",
    title: "Governed Outbound & Human Gate",
    badge: "Safety Governed",
    description:
      "Engineered for enterprise email deliverability and compliance. Every generated outreach message is held in a review queue until an operator signs off.",
    mechanisms: [
      "Human-in-the-loop approval gate for every outbound dispatch",
      "Strict daily sending throttles preventing spam triggers",
      "CAN-SPAM and GDPR compliant unsubscribe infrastructure",
      "Multi-mailbox rotation with warm-up monitoring",
    ],
    output: "High-deliverability outreach with 100% policy compliance.",
  },
  {
    number: "04",
    title: "Deal Acceleration & CRM Sync",
    badge: "Bi-directional Flow",
    description:
      "When prospects reply, conversations are instantly prioritized, meetings are scheduled, and deal records synchronize with your sales pipeline stages.",
    mechanisms: [
      "Automatic reply sentiment classification (Interested, Info, OOO)",
      "Instant CRM pipeline deal card generation",
      "Calendar scheduling link injection and meeting sync",
      "Operations task tracking with due-state indicators",
    ],
    output: "Accelerated sales pipeline with closed-loop revenue attribution.",
  },
];

export function LandingPipeline() {
  return (
    <section id="pipeline" className="py-20 md:py-28 border-t border-white/[0.08] relative bg-surface-canvas">
      {/* Specular hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>THE 4-STAGE ACQUISITION ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            From cold discovery to closed revenue.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Every step of the client acquisition lifecycle is orchestrated within a single cohesive system. No data silos, no unverified AI claims, and no disconnected point solutions.
          </p>
        </div>

        {/* 4 Pipeline Stage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage.number}
              className="bg-surface-card border border-white/[0.08] rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between hover:border-white/[0.18] transition-all duration-200 group"
            >
              {/* Card specular hairline */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

              <div>
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tighter">
                      {stage.number}
                    </span>
                    <span className="h-4 w-px bg-white/[0.15]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      Phase {stage.number}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-surface-panel border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                    {stage.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-zinc-100 transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  {stage.description}
                </p>

                {/* Mechanism items */}
                <div className="space-y-2.5 pt-4 border-t border-white/[0.06] mb-6">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                    Key Execution Mechanisms
                  </span>
                  {stage.mechanisms.map((mechanism, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-300">
                      <svg className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="leading-tight">{mechanism}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Output row */}
              <div className="pt-4 border-t border-white/[0.08] bg-surface-panel/40 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 px-6 sm:px-8 rounded-b-2xl flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-zinc-500 uppercase">Stage Outcome</span>
                <span className="text-zinc-300 font-medium text-right text-[11px] sm:text-xs">
                  {stage.output}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
