"use client";

import React, { useState } from "react";
import { SuppressionConfig } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="space-y-5">
      {/* 1. Global Domain Suppression List */}
      <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.08] p-5 space-y-4">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                Global Domain Suppression List
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Contacts belonging to these domain suffixes will be automatically disqualified and never contacted.
            </p>
          </div>

          <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-auto">
            {suppression.blockedDomains.length} BLOCKED
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <Input
              id="settings-add-domain"
              placeholder="e.g., company.com or competitor.org"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDomain())}
            />
          </div>
          <button
            type="button"
            onClick={handleAddDomain}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] inline-flex items-center gap-1.5 transition-all shrink-0 mt-auto"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Domain</span>
          </button>
        </div>

        <div className="pt-1">
          {suppression.blockedDomains.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#07070c] border border-dashed border-white/[0.08] text-center font-mono text-xs text-zinc-500">
              No domains currently suppressed
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suppression.blockedDomains.map((dom) => (
                <div
                  key={dom}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#07070c] border border-white/[0.08] hover:border-white/[0.16] text-xs font-mono text-zinc-300 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80" />
                  <span>{dom}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(dom)}
                    aria-label={`Remove ${dom} from suppression list`}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5 rounded -mr-0.5 focus:outline-none"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Inbound Reply Opt-Out Triggers */}
      <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.08] p-5 space-y-4">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                Inbound Reply Opt-Out Triggers
              </h4>
            </div>
            <p className="text-xs text-zinc-400">
              Incoming replies containing these phrases will instantly halt all follow-ups and permanently record the prospect as opted-out.
            </p>
          </div>

          <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-0.5 rounded-full shrink-0 self-start sm:self-auto">
            {suppression.optOutKeywords.length} TRIGGERS
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <Input
              id="settings-add-keyword"
              placeholder="e.g., do not contact, please stop"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
            />
          </div>
          <button
            type="button"
            onClick={handleAddKeyword}
            className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] inline-flex items-center gap-1.5 transition-all shrink-0 mt-auto"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Keyword</span>
          </button>
        </div>

        <div className="pt-1">
          {suppression.optOutKeywords.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#07070c] border border-dashed border-white/[0.08] text-center font-mono text-xs text-zinc-500">
              No opt-out triggers configured
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suppression.optOutKeywords.map((kw) => (
                <div
                  key={kw}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#07070c] border border-white/[0.08] hover:border-white/[0.16] text-xs font-mono text-zinc-300 transition-colors group"
                >
                  <span className="text-zinc-500">&ldquo;</span>
                  <span>{kw}</span>
                  <span className="text-zinc-500">&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    aria-label={`Remove ${kw} from opt-out triggers`}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-0.5 rounded -mr-0.5 focus:outline-none"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. CAN-SPAM / GDPR Mandatory Footer */}
      <div className="relative overflow-hidden rounded-xl bg-[#0c0c12] border border-white/[0.08] p-5 space-y-4">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-amber-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h4 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
              CAN-SPAM / GDPR Mandatory Footer
            </h4>
          </div>
          <span className="font-mono text-[10px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
            LEGAL COMPLIANCE
          </span>
        </div>

        <div className="space-y-4">
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
