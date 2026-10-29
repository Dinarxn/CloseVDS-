import React from "react";

interface SpecItem {
  metric: string;
  label: string;
  detail: string;
}

const SYSTEM_SPECS: SpecItem[] = [
  {
    metric: "100%",
    label: "Fact-Grounded Personalization",
    detail: "Every generated claim is extracted directly from audited target company websites.",
  },
  {
    metric: "0",
    label: "Unverified Hallucinations",
    detail: "Strict synthesis boundary rules prevent fabricated facts, dates, or product claims.",
  },
  {
    metric: "100%",
    label: "Human Approval Enforcement",
    detail: "Operators can review, refine, or reject every outbound email and campaign touch.",
  },
  {
    metric: "<250ms",
    label: "Deduplication & Search Latency",
    detail: "High-performance in-memory indexing prevents duplicate account outreach in real time.",
  },
  {
    metric: "RFC 5322",
    label: "Mailbox Standard Compliance",
    detail: "CAN-SPAM compliant headers, automated unsubscribe management, and sending rate throttling.",
  },
  {
    metric: "TLS 1.3",
    label: "Encrypted Credential Isolation",
    detail: "AES-256 encrypted credential storage with workspace-level isolation for all integrations.",
  },
];

export function LandingSpecs() {
  return (
    <section id="specs" className="py-20 md:py-28 border-t border-white/[0.08] relative bg-surface-canvas">
      {/* Specular hairline */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>EMPIRICAL BENCHMARKS & PARAMETERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            System specifications & engineering guarantees.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            CloseVDS is built on rigorous systems engineering standards. Our platform delivers verifiable operating parameters rather than inflated vanity metrics.
          </p>
        </div>

        {/* 6 Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SYSTEM_SPECS.map((spec, idx) => (
            <div
              key={idx}
              className="bg-surface-card border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/[0.16] transition-colors relative overflow-hidden"
            >
              {/* Card specular hairline */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight block mb-2 tabular-nums">
                  {spec.metric}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-zinc-200 mb-2">
                  {spec.label}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {spec.detail}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Verification Check</span>
                <span className="text-emerald-400 font-medium">Passed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
