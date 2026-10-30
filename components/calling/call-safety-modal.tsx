"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { api, ApiClientError } from "@/lib/api-client";
import { VoiceSafetyCheckResult } from "@/types/calling";

export interface CallSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId: string;
}

export function CallSafetyModal({ isOpen, onClose, callId }: CallSafetyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [safetyResult, setSafetyResult] = useState<VoiceSafetyCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !callId) {
      setSafetyResult(null);
      setErrorMsg(null);
      return;
    }

    const runSafetyCheck = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await api.voice.checkSafety(callId);
        if (res.data) {
          setSafetyResult(res.data);
        }
      } catch (err: unknown) {
        if (err instanceof ApiClientError) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg("Failed to execute server safety check on call.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    runSafetyCheck();
  }, [isOpen, callId]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Authoritative Voice Safety Evaluation"
      description={`Call ID: ${callId}. Evaluated against all 18 multi-tenant, suppression, rate-limiting, and provider compliance gates.`}
      className="max-w-xl max-h-[85vh] overflow-y-auto"
    >
      <div className="space-y-4">
        {errorMsg && (
          <Alert variant="destructive" title="Safety Service Error">
            {errorMsg}
          </Alert>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="font-mono">Executing 18-point safety check against database and suppression tables...</span>
          </div>
        ) : safetyResult ? (
          <div className="space-y-4">
            {/* Status Summary Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                safetyResult.passed
                  ? "bg-lime-500/15 text-[#C6FF33] border-lime-500/35"
                  : "bg-rose-950/40 text-rose-300 border-rose-500/35"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    safetyResult.passed ? "bg-[#C6FF33]" : "bg-rose-500"
                  }`}
                />
                <span className="font-sans">
                  {safetyResult.passed
                    ? "Safe for Outbound Dispatch"
                    : "Call Blocked by Safety Enclosure"}
                </span>
              </div>
              <span className="font-mono text-[11px]">
                {safetyResult.evaluatedGates.filter((g) => g.passed).length}/
                {safetyResult.evaluatedGates.length} Gates Passed
              </span>
            </div>

            {/* Blocked Reason Callout */}
            {safetyResult.blockedReason && (
              <Alert variant="destructive" title="Primary Block Reason">
                {safetyResult.blockedReason}
              </Alert>
            )}

            {/* Gate breakdown list */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                18 Evaluated Compliance Rules
              </span>

              <div className="divide-y divide-white/[0.04] bg-surface-panel rounded-xl border border-white/[0.08] overflow-hidden text-xs">
                {safetyResult.evaluatedGates.map((gate) => (
                  <div
                    key={gate.gateName || gate.gateNumber}
                    className="p-3 flex items-start justify-between gap-3 hover:bg-surface-elevated/50 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            gate.passed ? "bg-[#C6FF33]" : "bg-rose-500"
                          }`}
                        />
                        <span className="font-semibold text-white font-mono text-[11px] truncate">
                          {gate.gateName || `Gate ${gate.gateNumber}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 pl-3.5 leading-relaxed font-sans">
                        {gate.reason}
                      </p>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 font-semibold ${
                        gate.passed
                          ? "bg-lime-500/10 text-[#C6FF33] border border-lime-500/25"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/25"
                      }`}
                    >
                      {gate.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={onClose} className="border-white/[0.08]">
                Close Safety Review
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}