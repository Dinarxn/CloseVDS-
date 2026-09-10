"use client";

import React from "react";
import { SafetyLimitsConfig } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

export interface SafetyBoundsTabProps {
  safety: SafetyLimitsConfig;
  onChange: (field: keyof SafetyLimitsConfig, value: unknown) => void;
  onOpenKillSwitch: () => void;
}

export function SafetyBoundsTab({
  safety,
  onChange,
  onOpenKillSwitch,
}: SafetyBoundsTabProps) {
  return (
    <div className="space-y-6">
      {/* Emergency Kill Switch Header */}
      <div className="p-4 bg-[#0a0a0a] border border-[#404040] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-white">Emergency Global Kill Switch</h4>
            <Badge variant={safety.globalKillSwitchActive ? "solid" : "outline"}>
              {safety.globalKillSwitchActive ? "ACTIVE — SENDING HALTED" : "INACTIVE — NORMAL"}
            </Badge>
          </div>
          <p className="text-xs text-[#737373] max-w-xl leading-relaxed">
            Instantly halt all outbound outreach dispatches, sequence progression, and follow-up sending across the entire workspace.
          </p>
        </div>

        <Button
          variant={safety.globalKillSwitchActive ? "primary" : "destructive"}
          size="sm"
          onClick={onOpenKillSwitch}
          className="font-bold shrink-0"
        >
          {safety.globalKillSwitchActive ? "Deactivate Kill Switch" : "Activate Emergency Kill Switch"}
        </Button>
      </div>

      {/* Sending Caps & Velocity */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Outreach Velocity &amp; Daily Caps
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="safety-daily-cap"
            label="Daily Max Outreach Cap"
            type="number"
            value={safety.dailyOutreachCap.toString()}
            onChange={(e) => onChange("dailyOutreachCap", parseInt(e.target.value, 10) || 0)}
            helperText="Hard ceiling on total outbound dispatches across all active operations (MVP max 50)."
          />

          <Input
            id="safety-delay-sec"
            label="Dispatch Delay Interval (Seconds)"
            type="number"
            value={safety.dispatchDelaySeconds.toString()}
            onChange={(e) => onChange("dispatchDelaySeconds", parseInt(e.target.value, 10) || 0)}
            helperText="Randomized jitter spacing between individual dispatches to prevent burst flagging."
          />
        </div>
      </div>

      {/* Sending Windows */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Timezone &amp; Delivery Windows
        </h4>

        <div className="space-y-3">
          <Checkbox
            id="safety-biz-hours"
            label="Enforce Recipient Business Hours Delivery Only"
            checked={safety.businessHoursOnly}
            onChange={(e) => onChange("businessHoursOnly", e.target.checked)}
            description="Dispatches will only be sent between 9:00 AM and 5:00 PM in the target recipient's local timezone."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              id="safety-window-start"
              label="Window Start Time"
              type="time"
              value={safety.sendingWindowStart}
              onChange={(e) => onChange("sendingWindowStart", e.target.value)}
            />

            <Input
              id="safety-window-end"
              label="Window End Time"
              type="time"
              value={safety.sendingWindowEnd}
              onChange={(e) => onChange("sendingWindowEnd", e.target.value)}
            />
          </div>
        </div>
      </div>

      <Alert variant="default" title="Phase 1 Safety Configuration">
        These safety bounds govern the dispatch orchestration queue. Values are currently held in local configuration state and will bind to the Fastify rate limiter in Phase 2.
      </Alert>
    </div>
  );
}
