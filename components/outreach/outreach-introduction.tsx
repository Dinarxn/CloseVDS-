import React from "react";
import { Badge } from "@/components/ui/badge";

export function OutreachIntroduction() {
  return (
    <div className="p-6 bg-[#121216] border border-white/[0.08] rounded-xl space-y-4 relative overflow-hidden shadow-sm">
      {/* Top light reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-white tracking-tight">
              Permission-Gated Outreach Pipeline
            </h2>
            <Badge variant="solid" size="sm">Human-in-the-Loop</Badge>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
            closeVDS operates with strict permission gates. The AI researches leads, audits website gaps, and drafts hyper-personalized copy — but no outbound communication is ever sent without your explicit review and approval.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-1 transition-all duration-150 hover:border-white/[0.14]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Gate 1</span>
          <p className="text-xs font-semibold text-white tracking-tight">AI Research &amp; Draft</p>
          <p className="text-[11px] text-zinc-400">Identifies verified business gaps from website audit.</p>
        </div>

        <div className="p-3.5 bg-[#0d0d12] border border-indigo-500/40 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-indigo-300 uppercase font-bold">Gate 2 &bull; Active</span>
          <p className="text-xs font-semibold text-white tracking-tight">Operator Review</p>
          <p className="text-[11px] text-zinc-300">You review subject, body, and CTA before any dispatch.</p>
        </div>

        <div className="p-3.5 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-1 transition-all duration-150 hover:border-white/[0.14]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Gate 3</span>
          <p className="text-xs font-semibold text-white tracking-tight">Controlled Dispatch</p>
          <p className="text-[11px] text-zinc-400">Sent via authenticated domain within velocity limits.</p>
        </div>

        <div className="p-3.5 bg-[#0d0d12] border border-white/[0.06] rounded-xl space-y-1 transition-all duration-150 hover:border-white/[0.14]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">Gate 4</span>
          <p className="text-xs font-semibold text-white tracking-tight">Follow-Up Permission</p>
          <p className="text-[11px] text-zinc-400">Follow-up touch is prepared and gated on your sign-off.</p>
        </div>
      </div>
    </div>
  );
}
