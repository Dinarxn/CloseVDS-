"use client";

import React from "react";
import { GeneralSettingsConfig } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface GeneralSettingsTabProps {
  general: GeneralSettingsConfig;
  onChange: (field: keyof GeneralSettingsConfig, value: unknown) => void;
}

export function GeneralSettingsTab({
  general,
  onChange,
}: GeneralSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Workspace Profile */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Workspace Profile
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="settings-workspace-name"
            label="Acquisition Workspace Name"
            value={general.workspaceName}
            onChange={(e) => onChange("workspaceName", e.target.value)}
            helperText="The identifier for this client acquisition instance."
          />

          <Input
            id="settings-operator-email"
            label="Primary Operator Email"
            type="email"
            value={general.operatorEmail}
            onChange={(e) => onChange("operatorEmail", e.target.value)}
            helperText="Receives high-priority notifications when prospect replies occur."
          />
        </div>
      </div>

      {/* Operator Notification Preferences */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Operator Alert Preferences
        </h4>

        <div className="space-y-3">
          <Checkbox
            id="settings-notify-reply"
            label="Alert when a prospect replies to an outbound interaction"
            checked={general.notifyOnReply}
            onChange={(checked) => onChange("notifyOnReply", checked)}
          />

          <Checkbox
            id="settings-notify-meeting"
            label="Alert when a prospect requests or books a discovery call"
            checked={general.notifyOnMeeting}
            onChange={(checked) => onChange("notifyOnMeeting", checked)}
          />

          <Checkbox
            id="settings-notify-safety"
            label="Alert if bounce rate or spam report thresholds are approached"
            checked={general.notifyOnSafetyAlert}
            onChange={(checked) => onChange("notifyOnSafetyAlert", checked)}
          />
        </div>
      </div>
    </div>
  );
}
