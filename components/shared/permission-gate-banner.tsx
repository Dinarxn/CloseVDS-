import React from "react";
import { Badge } from "@/components/ui/badge";

export type PermissionGateStage = "research" | "review" | "dispatch" | "followup";

export interface PermissionGateBannerProps {
  currentStage?: PermissionGateStage;
  className?: string;
}

export function PermissionGateBanner({
  currentStage = "review",
  className = "",
}: PermissionGateBannerProps) {
  const stages = [
    {
      id: "research",
      gateNumber: "1",
      title: "AI Research",
      description: "Extracts website gap facts & ICP relevance",
    },
    {
      id: "review",
      gateNumber: "2",
      title: "Human Review",
      description: "Operator approves outreach & dialogue plan",
    },
    {
      id: "dispatch",
      gateNumber: "3",
      title: "Controlled Send",
      description: "Dispatched within daily velocity bounds",
    },
    {
      id: "followup",
      gateNumber: "4",
      title: "Follow-up Gate",
      description: "Gated on explicit operator sign-off",
    },
  ];

  return (
    <div
      className={`relative rounded-xl p-3 sm:p-3.5 bg-[#0c0c14]/70 border border-white/[0.06] backdrop-blur-sm space-y-2.5 ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-white">
            Permission-Gated Architecture
          </h3>
          <Badge variant="solid" size="sm" className="font-mono text-[9px] bg-white/[0.08] border border-white/[0.12] text-zinc-300 font-medium">
            Human-in-the-Loop
          </Badge>
          <span className="hidden md:inline-block text-zinc-600 text-xs">•</span>
          <p className="text-[11px] text-zinc-400 hidden md:block">
            Multi-stage autonomous protocol enforcing operator authorization at outreach boundaries.
          </p>
        </div>

        <span className="text-[10px] font-mono text-zinc-500 shrink-0 self-start sm:self-center">
          AI Prepares &bull; Operator Approves &bull; System Dispatches
        </span>
      </div>

      {/* 4 Gate Unified Sequence Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-[#07070c]/70 p-1.5 rounded-lg border border-white/[0.04]">
        {stages.map((stage) => {
          const isActive = stage.id === currentStage;
          return (
            <div
              key={stage.id}
              className={`group relative p-2.5 sm:p-3 rounded-md border text-xs transition-all duration-150 ${
                isActive
                  ? "bg-emerald-950/20 border-emerald-500/35 text-white shadow-xs"
                  : "bg-transparent border-transparent hover:border-white/[0.06] text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-semibold ${isActive ? "text-emerald-400" : "text-zinc-500"}`}>
                  Gate 0{stage.gateNumber}
                </span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Active Gate
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-zinc-600">
                    Standby
                  </span>
                )}
              </div>

              <div className="mt-1">
                <p className={`font-medium text-xs tracking-tight ${isActive ? "text-white" : "text-zinc-300"}`}>
                  {stage.title}
                </p>
                <p className={`text-[11px] leading-snug mt-0.5 ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

