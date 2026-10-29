import React from "react";

interface FeatureItem {
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  capabilities: string[];
}

const FEATURES: FeatureItem[] = [
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    category: "Discovery Engine",
    title: "Precision Prospecting & ICP Ingestion",
    description:
      "Find and filter high-fit target accounts based on real-time industry parameters, employee tiers, and technical indicators. Import large CSV lists with instant deduplication.",
    capabilities: [
      "Custom ICP criteria & geo/industry filters",
      "Real-time CSV duplicate reconciliation",
      "Permanent record deletion with safety confirmation",
      "Rich contact graph & corporate hierarchy mapping",
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    category: "Opportunity Audit",
    title: "Deterministic AI Fact Extraction",
    description:
      "Unlike generic LLM prompt wrappers, CloseVDS grounds all personalization in verified crawl data. Extracted tech stacks and pain points are linked to source evidence.",
    capabilities: [
      "Deep website and digital footprint auditing",
      "Technology stack & infrastructure discovery",
      "Fact-checked pain point & objection synthesis",
      "Zero-hallucination policy compliance",
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    category: "Governed Outbound",
    title: "Safety-First Multichannel Outreach",
    description:
      "Engineered for enterprise email deliverability. All outbound touches pass through an operator approval queue with strict daily sending limits and CAN-SPAM safety checks.",
    capabilities: [
      "Mandatory operator sign-off before dispatch",
      "Strict daily mailbox throttle protection",
      "Configurable follow-up cadences & delay intervals",
      "Instant opt-out & suppression list management",
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    category: "Sales Pipeline",
    title: "Interactive CRM & Deal Progression",
    description:
      "Visually track every active deal across custom sales stages. Drag-and-drop deal management with deal size attribution, lead relationship links, and stage conversion analytics.",
    capabilities: [
      "Visual sales stages (Discovery, Qualified, Proposal, Won)",
      "Direct lead-to-deal attribution & contact tracking",
      "Deal value calculation & revenue forecasting",
      "Historical deal activity audit trail",
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    category: "Operations Center",
    title: "Task Orchestration & Due Indicators",
    description:
      "Never miss a critical sales action. The operations workspace consolidates upcoming follow-ups, pending operator approvals, overdue tasks, and client touchpoints.",
    capabilities: [
      "Task list with overdue, due-today, and scheduled states",
      "One-click task status transitions & completion logs",
      "Follow-up scheduling linked to specific lead records",
      "Operator assignment & workflow accountability",
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    category: "Enterprise Security",
    title: "Sovereign Architecture & Tenant Isolation",
    description:
      "Deploy with enterprise confidence. CloseVDS isolates each workspace with private data boundaries, strict encryption, role-based controls, and zero third-party model retraining.",
    capabilities: [
      "Workspace-level database & credential isolation",
      "Encrypted API key storage for CRM & SMTP integrations",
      "Audit logs for all automated and operator actions",
      "Exportable customer data without vendor lock-in",
    ],
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-20 md:py-28 border-t border-white/[0.08] relative bg-surface-canvas">
      {/* Specular hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>CORE SYSTEM CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Built for enterprise acquisition teams.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            Every subsystem is crafted for precision, reliability, and governance. Designed from first principles to scale client acquisition without sacrificing deliverability or brand trust.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="bg-surface-card border border-white/[0.08] rounded-2xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between hover:border-white/[0.18] transition-all duration-200 group"
            >
              {/* Top specular hairline */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-panel border border-white/[0.10] flex items-center justify-center shadow-xs group-hover:border-white/[0.22] transition-colors">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 px-2 py-0.5 rounded bg-surface-panel border border-white/[0.06]">
                    {feature.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-zinc-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-5">
                  {feature.description}
                </p>

                {/* Capabilities list */}
                <div className="space-y-2 pt-4 border-t border-white/[0.06]">
                  {feature.capabilities.map((cap, capIdx) => (
                    <div key={capIdx} className="flex items-center space-x-2 text-xs text-zinc-300">
                      <span className="w-1 h-1 rounded-full bg-white shrink-0" />
                      <span className="text-[11px] leading-tight">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Autonomous Subsystem</span>
                <span className="text-zinc-300">Operational</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
