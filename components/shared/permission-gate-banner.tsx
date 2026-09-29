import React from "react";

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
      className={`relative rounded-xl p-3 sm:p-3.5 bg-[#0a0a0f] border border-white/[0.06] shadow-xs backdrop-blur-sm space-y-2.5 ${className}`}
    >
      {/* Top specular hairline highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.10] to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <h3 className="text-xs font-semibold tracking-tight text-zinc-100">
            Permission-Gated Architecture
          </h3>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-zinc-400 font-medium">
            Human-in-the-Loop
          </span>
          <span className="hidden md:inline-block text-zinc-700 text-xs">•</span>
          <p className="text-[11px] text-zinc-500 hidden md:block">
            Multi-stage autonomous protocol enforcing operator authorization at outreach boundaries.
          </p>
        </div>

        <span className="text-[10px] font-mono text-zinc-500 shrink-0 self-start sm:self-center">
          AI Prepares &bull; Operator Approves &bull; System Dispatches
        </span>
      </div>

      {/* 4 Gate Unified Operational Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-lg overflow-hidden border border-white/[0.05]">
        {stages.map((stage) => {
          const isActive = stage.id === currentStage;
          return (
            <div
              key={stage.id}
              className={`relative p-2.5 sm:p-3 transition-colors ${
                isActive
                  ? "bg-[#0c1311] text-white"
                  : "bg-[#09090d] hover:bg-[#0d0d14] text-zinc-400"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              )}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-medium tracking-wider uppercase ${isActive ? "text-emerald-400" : "text-zinc-500"}`}>
                  Gate 0{stage.gateNumber}
                </span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    Active Gate
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-zinc-600">
                    Standby
                  </span>
                )}
              </div>

              <div className="mt-1.5">
                <p className={`font-medium text-xs tracking-tight ${isActive ? "text-white" : "text-zinc-200"}`}>
                  {stage.title}
                </p>
                <p className={`text-[11px] leading-relaxed mt-0.5 line-clamp-2 ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>
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

