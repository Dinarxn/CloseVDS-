import React from "react";

interface ArchPillar {
  title: string;
  badge: string;
  description: string;
  spec: string;
}

const ARCH_PILLARS: ArchPillar[] = [
  {
    title: "Zero-Hallucination Policy",
    badge: "Deterministic LLM",
    description:
      "Outreach copy is generated exclusively using extracted facts from audited target domains. If a data point cannot be confirmed via source text, it is omitted.",
    spec: "Strict factual grounding & cite verification",
  },
  {
    title: "Governed Approval Safeguards",
    badge: "Human Gate",
    description:
      "Autonomous systems should empower operators, not run amok. Every synthesized message and call queue item requires human authorization before transmission.",
    spec: "100% pre-dispatch review gate by default",
  },
  {
    title: "Rate-Throttle & Reputation Shield",
    badge: "Deliverability",
    description:
      "Protect your corporate domain reputation. CloseVDS implements dynamic IP warmup curves, mailbox rotation, and strictly bounded hourly dispatch limits.",
    spec: "Configurable per-inbox volume caps & CAN-SPAM checks",
  },
  {
    title: "Sovereign Enterprise Boundary",
    badge: "Isolation",
    description:
      "All leads, contact records, campaign metrics, and credentials reside within your dedicated tenant container. Your data is never used to train global AI models.",
    spec: "Private workspace isolation & encrypted keys",
  },
];

export function LandingArchitecture() {
  return (
    <section id="architecture" className="py-20 md:py-28 border-t border-white/[0.08] relative bg-surface-canvas">
      {/* Top specular hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ENTERPRISE ARCHITECTURE & SAFETY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Engineered for trust, safety, and scale.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            CloseVDS eliminates the risks associated with reckless AI automation. Our architecture enforces strict mathematical bounds, human sign-off gates, and private data sovereignty.
          </p>
        </div>

        {/* Visual Architecture Diagram Box */}
        <div className="bg-surface-card border border-white/[0.08] rounded-2xl p-6 sm:p-10 relative overflow-hidden mb-14 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-white/[0.06] mb-8 gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                Data Flow Topology
              </span>
              <h3 className="text-xl font-bold text-white">Autonomous Ingestion & Governance Loop</h3>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-panel border border-white/[0.08] text-[11px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE SYSTEM TOPOLOGY</span>
            </div>
          </div>

          {/* Diagram Flow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-surface-panel rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Step 01</span>
                <h4 className="text-sm font-bold text-white">Multi-Source Ingest</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Web domains, verified registries, CSV uploads.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400">
                &gt; Deduplicated
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-panel rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Step 02</span>
                <h4 className="text-sm font-bold text-white">Empirical Crawler</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Extracts tech stack, digital footprint, announcements.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400">
                &gt; Fact Grounded
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-panel rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Step 03</span>
                <h4 className="text-sm font-bold text-white">Synthesis Engine</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Personalizes hook and aligns value proposition.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400">
                &gt; Zero Hallucination
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-surface-panel rounded-xl border border-amber-500/30 p-4 flex flex-col justify-between relative shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">Step 04</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Human Review Gate</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Operator approves, edits, or discards message.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-amber-400">
                &gt; Mandatory Sign-off
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-surface-panel rounded-xl border border-white/[0.08] p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">Step 05</span>
                <h4 className="text-sm font-bold text-white">CRM & Deal Sync</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dispatches via safe throttle and updates pipeline.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/[0.06] text-[10px] font-mono text-emerald-400">
                &gt; Live Deal Created
              </div>
            </div>
          </div>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ARCH_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-surface-card border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between hover:border-white/[0.16] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-white">{pillar.title}</h4>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface-panel border border-white/[0.08] text-zinc-300">
                    {pillar.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-4">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Architecture Specification</span>
                <span className="text-zinc-200 font-semibold">{pillar.spec}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
