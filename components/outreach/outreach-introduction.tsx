import React from "react";
import { Badge } from "@/components/ui/badge";

export function OutreachIntroduction() {
  return (
    <div className="relative p-5 sm:p-6 bg-surface-card border border-white/[0.08] rounded-xl space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* Specular hairline top reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <h2 className="text-base font-semibold text-white tracking-tight">
              Permission-Gated Outreach Pipeline
            </h2>
            <Badge variant="solid" size="sm" className="bg-[#7D39EB] text-white">Human-in-the-Loop</Badge>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl font-sans">
            closeVDS operates with strict permission gates. The AI researches leads, audits website gaps, and drafts hyper-personalized copy — but no outbound communication is ever sent without your explicit review and approval.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
        <div className="p-3.5 bg-surface-panel border border-white/[0.07] rounded-xl space-y-1 transition-all duration-150 hover:border-white/[0.14]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Gate 1</span>
          <p className="text-xs font-semibold text-white tracking-tight">AI Research &amp; Draft</p>
          <p className="text-[11px] text-zinc-400 leading-snug">Identifies verified business gaps from website audit.</p>
        </div>

        <div className="p-3.5 bg-surface-elevated border border-[#7D39EB]/40 rounded-xl space-y-1 shadow-[0_0_15px_rgba(125,57,235,0.12)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#C6FF33] uppercase font-bold">Gate 2 &bull; Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shrink-0" />
          </div>
          <p className="text-xs font-semibold text-white tracking-tight">Operator Review</p>
          <p className="text-[11px] text-zinc-300 leading-snug">You review subject, body, and CTA before any dispatch.</p>
        </div>

        <div className="p-3.5 bg-surface-panel border border-white/[0.07] rounded-xl space-y-1 transition-all duration-150 hover:border-white/[0.14]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Gate 3</span>
          <p className="text-xs font-semibold text-white tracking-tight">Controlled Dispatch</p>
          <p className="text-[11px] text-zinc-400 leading-snug">Sent via authenticated domain within velocity limits.</p>
        </div>

        <div className="p-3.5 bg-surface-panel border border-white/[0.07] rounded-xl space-y-1 transition-all duration-150 hover:border-white/[0.14]">
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Gate 4</span>
          <p className="text-xs font-semibold text-white tracking-tight">Follow-Up Permission</p>
          <p className="text-[11px] text-zinc-400 leading-snug">Follow-up touch is prepared and gated on your sign-off.</p>
        </div>
      </div>
    </div>
  );
}