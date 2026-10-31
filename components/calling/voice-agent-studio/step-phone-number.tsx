"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TelephonyPhoneNumber } from "@/types/calling";
import { api } from "@/lib/api-client";

export interface StepPhoneNumberProps {
  assignedPhoneNumberId: string | null | undefined;
  onPhoneNumberSelect: (phoneNumberId: string | null, phoneNumber?: string | null) => void;
  agentId?: string;
  agentStatus?: string;
}

export function StepPhoneNumber({
  assignedPhoneNumberId,
  onPhoneNumberSelect,
  agentId,
}: StepPhoneNumberProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<TelephonyPhoneNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [validationResult, setValidationResult] = useState<{
    compatible: boolean;
    reason?: string;
    phoneNumber?: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Load workspace phone numbers
  useEffect(() => {
    setIsLoading(true);
    api.voice
      .listPhoneNumbers()
      .then((res) => {
        if (res?.data) {
          setPhoneNumbers(res.data);
        }
      })
      .catch(() => {
        // Fallback or empty
      })
      .finally(() => setIsLoading(false));
  }, []);

  const validateCompatibility = useCallback(
    async (numberId: string) => {
      setIsValidating(true);
      try {
        const res = await api.voice.validateNumberCompatibility({
          phoneNumberId: numberId,
          agentId,
        });
        if (res?.data) {
          setValidationResult(res.data);
        }
      } catch (err: unknown) {
        setValidationResult({
          compatible: false,
          reason: err instanceof Error ? err.message : "Compatibility check failed",
        });
      } finally {
        setIsValidating(false);
      }
    },
    [agentId]
  );

  // Validate initially if an ID is pre-selected
  useEffect(() => {
    if (assignedPhoneNumberId) {
      validateCompatibility(assignedPhoneNumberId);
    } else {
      setValidationResult(null);
    }
  }, [assignedPhoneNumberId, validateCompatibility]);

  const handleSelect = (num: TelephonyPhoneNumber) => {
    if (assignedPhoneNumberId === num.id) {
      onPhoneNumberSelect(null, null);
      setValidationResult(null);
    } else {
      onPhoneNumberSelect(num.id, num.phoneNumber);
      validateCompatibility(num.id);
    }
  };

  const selectedNumber = phoneNumbers.find((p) => p.id === assignedPhoneNumberId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Step 8: Carrier Phone Number &amp; Compatibility Engine
        </h3>
        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
          Assign a verified carrier telephony line for outbound caller ID and inbound routing. The compatibility engine prevents multi-agent number collisions.
        </p>
      </div>

      {/* Selected Number Status Banner */}
      {selectedNumber ? (
        <div
          className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            validationResult?.compatible
              ? "bg-lime-950/20 border-lime-500/30 shadow-[0_0_12px_rgba(198,255,51,0.1)]"
              : validationResult?.compatible === false
              ? "bg-rose-950/20 border-rose-500/40"
              : "bg-surface-card border-white/[0.08]"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white text-sm">
                {selectedNumber.phoneNumber}
              </span>
              {selectedNumber.friendlyName && (
                <span className="text-xs text-zinc-400">({selectedNumber.friendlyName})</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Status:</span>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                  validationResult?.compatible
                    ? "bg-lime-500/10 text-[#C6FF33] border border-lime-500/30"
                    : "bg-rose-500/15 text-rose-300 border border-rose-500/40"
                }`}
              >
                {isValidating
                  ? "Validating Compatibility..."
                  : validationResult?.compatible
                  ? "✓ Compatible & Verified for Voice Outreach"
                  : `✗ Incompatible: ${validationResult?.reason || "Check failed"}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onPhoneNumberSelect(null, null)}
            className="text-xs text-zinc-400 hover:text-white underline self-start sm:self-auto cursor-pointer"
          >
            Unassign Line
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/10 p-4 flex items-start gap-3">
          <span className="text-amber-400 text-base mt-0.5">⚠</span>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-amber-200">No Phone Number Assigned</h4>
            <p className="text-xs text-amber-200/80 leading-relaxed font-sans">
              An agent can be saved as a draft without a phone number, but <strong>activation is blocked</strong> by the backend readiness gate until an active, verified voice carrier line is assigned.
            </p>
          </div>
        </div>
      )}

      {/* Available Phone Numbers */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
          Workspace Registered Telephony Numbers ({phoneNumbers.length} Available)
        </span>

        {isLoading ? (
          <div className="p-8 text-center rounded-xl border border-white/[0.08] bg-surface-card text-zinc-400 text-xs font-mono">
            Loading workspace carrier lines...
          </div>
        ) : phoneNumbers.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-white/[0.08] bg-surface-card space-y-2">
            <p className="text-xs text-zinc-400">No phone numbers have been imported into this workspace yet.</p>
            <p className="text-[11px] text-zinc-500 font-mono">
              Navigate to AI Calling → Phone Numbers to import Twilio carrier numbers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phoneNumbers.map((num) => {
              const isSelected = assignedPhoneNumberId === num.id;
              const hasVoice = num.capabilities?.voice;

              return (
                <div
                  key={num.id}
                  onClick={() => handleSelect(num)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-violet-950/30 border-violet-500/80 shadow-[0_0_12px_rgba(125,57,235,0.2)]"
                      : "bg-surface-panel/50 border-white/[0.08] hover:border-white/[0.2] hover:bg-surface-panel"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold font-mono text-white block">
                          {num.phoneNumber}
                        </span>
                        {num.friendlyName && (
                          <span className="text-xs text-zinc-400">{num.friendlyName}</span>
                        )}
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-violet-400 bg-violet-600"
                            : "border-zinc-600 bg-zinc-900"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-white/[0.06]">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                          hasVoice
                            ? "bg-lime-500/10 text-[#C6FF33] border-lime-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        Voice: {hasVoice ? "Enabled" : "Disabled"}
                      </span>

                      {num.capabilities?.sms && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-zinc-300 border border-white/[0.08]">
                          SMS
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-zinc-500 ml-auto">
                        Provider: {num.provider}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
