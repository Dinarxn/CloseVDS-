"use client";

import React, { useState } from "react";
import { SuppressionConfig } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SuppressionRulesTabProps {
  suppression: SuppressionConfig;
  onChange: (field: keyof SuppressionConfig, value: unknown) => void;
}

export function SuppressionRulesTab({
  suppression,
  onChange,
}: SuppressionRulesTabProps) {
  const [newDomain, setNewDomain] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase().replace(/^@/, "");
    if (!suppression.blockedDomains.includes(clean)) {
      onChange("blockedDomains", [...suppression.blockedDomains, clean]);
    }
    setNewDomain("");
  };

  const handleRemoveDomain = (domain: string) => {
    onChange(
      "blockedDomains",
      suppression.blockedDomains.filter((d) => d !== domain)
    );
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    const clean = newKeyword.trim().toLowerCase();
    if (!suppression.optOutKeywords.includes(clean)) {
      onChange("optOutKeywords", [...suppression.optOutKeywords, clean]);
    }
    setNewKeyword("");
  };

  const handleRemoveKeyword = (keyword: string) => {
    onChange(
      "optOutKeywords",
      suppression.optOutKeywords.filter((k) => k !== keyword)
    );
  };

  return (
    <div className="space-y-6">
      {/* Blocked Domains */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Global Domain Suppression List
          </h4>
          <p className="text-xs text-[#737373]">
            Contacts belonging to these domain suffixes will be automatically disqualified and never contacted.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              id="settings-add-domain"
              placeholder="e.g., company.com or competitor.org"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDomain())}
            />
          </div>
          <Button variant="secondary" size="md" onClick={handleAddDomain} className="h-9">
            Add Domain
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {suppression.blockedDomains.map((dom) => (
            <Badge key={dom} variant="outline" className="text-xs py-1 px-2.5 flex items-center space-x-1.5">
              <span>{dom}</span>
              <button
                onClick={() => handleRemoveDomain(dom)}
                aria-label={`Remove ${dom} from suppression list`}
                className="hover:text-white text-[#737373] ml-1 font-bold"
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Opt-Out Keywords */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
            Inbound Reply Opt-Out Triggers
          </h4>
          <p className="text-xs text-[#737373]">
            Incoming replies containing these phrases will instantly halt all follow-ups and permanently record the prospect as opted-out.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              id="settings-add-keyword"
              placeholder="e.g., do not contact, please stop"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
            />
          </div>
          <Button variant="secondary" size="md" onClick={handleAddKeyword} className="h-9">
            Add Keyword
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {suppression.optOutKeywords.map((kw) => (
            <Badge key={kw} variant="outline" className="text-xs py-1 px-2.5 flex items-center space-x-1.5">
              <span>&ldquo;{kw}&rdquo;</span>
              <button
                onClick={() => handleRemoveKeyword(kw)}
                aria-label={`Remove ${kw} from opt-out triggers`}
                className="hover:text-white text-[#737373] ml-1 font-bold"
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="p-5 bg-[#171717] border border-[#404040] rounded-lg space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          CAN-SPAM / GDPR Mandatory Footer
        </h4>

        <div className="space-y-3">
          <Textarea
            id="settings-address-footer"
            label="Physical Business Address &amp; Unsubscribe Notice"
            value={suppression.physicalAddressFooter}
            onChange={(e) => onChange("physicalAddressFooter", e.target.value)}
            rows={2}
            helperText="Appended to all outbound cold email dispatches to satisfy international anti-spam legislation."
          />

          <Checkbox
            id="settings-one-click-unsub"
            label="Include Direct One-Click Unsubscribe Link in Headers"
            checked={suppression.requireOneClickUnsubscribe}
            onChange={(e) => onChange("requireOneClickUnsubscribe", e.target.checked)}
            description="Injects RFC 8058 List-Unsubscribe headers for mail client compliance."
          />
        </div>
      </div>
    </div>
  );
}
