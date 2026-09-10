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
      description: "Extracts website gap facts",
    },
    {
      id: "review",
      gateNumber: "2",
      title: "Human Review",
      description: "Operator approves copy",
    },
    {
      id: "dispatch",
      gateNumber: "3",
      title: "Controlled Send",
      description: "Dispatched within velocity bounds",
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
      className={`p-4 bg-[#171717] border border-[#404040] rounded-lg space-y-3 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Permission-Gated Architecture
          </span>
          <Badge variant="solid">Human-in-the-Loop</Badge>
        </div>
        <span className="text-[11px] text-[#737373] font-mono">
          AI Prepares &bull; Operator Approves &bull; System Dispatches
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {stages.map((stage) => {
          const isActive = stage.id === currentStage;
          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-md border text-xs space-y-0.5 ${
                isActive
                  ? "bg-[#0a0a0a] border-white/80"
                  : "bg-[#0a0a0a]/60 border-[#404040]/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#737373]">Gate {stage.gateNumber}</span>
                {isActive && <Badge variant="outline" className="text-[9px] px-1 py-0">Active Gate</Badge>}
              </div>
              <p className="font-semibold text-white text-[11px]">{stage.title}</p>
              <p className="text-[10px] text-[#737373] line-clamp-1">{stage.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
