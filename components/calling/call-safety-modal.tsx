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
          <div className="py-12 text-center text-xs text-[#737373]">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Executing 18-point safety check against database and suppression tables...
          </div>
        ) : safetyResult ? (
          <div className="space-y-4">
            {/* Status Summary Banner */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs font-semibold ${
                safetyResult.passed
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-800"
                  : "bg-rose-950/40 text-rose-300 border-rose-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    safetyResult.passed ? "bg-emerald-400" : "bg-rose-500"
                  }`}
                />
                <span>
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

            {/* Gate by Gate Table */}
            <div className="border border-[#404040] rounded-lg overflow-hidden bg-[#171717]">
              <div className="max-h-80 overflow-y-auto divide-y divide-[#404040]/50 text-xs">
                {safetyResult.evaluatedGates.map((gate, i) => (
                  <div
                    key={gate.gateNumber || i}
                    className="p-3 flex items-start justify-between gap-3 hover:bg-[#404040]/20 transition-colors"
                  >
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            gate.passed ? "bg-emerald-400" : "bg-rose-500"
                          }`}
                        />
                        <span className="font-semibold text-white font-mono text-[11px]">
                          Gate #{gate.gateNumber}: {gate.gateName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a3a3a3] pl-3.5 leading-relaxed">
                        {gate.reason || (gate.passed ? "Check passed" : "Check failed")}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                        gate.passed
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/80"
                          : "bg-rose-950/60 text-rose-400 border border-rose-800/80"
                      }`}
                    >
                      {gate.passed ? "PASS" : "BLOCK"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close Safety Report
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
