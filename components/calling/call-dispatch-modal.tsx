"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CallWithRelations, CallDispatchResult } from "@/types/calling";
import { api, ApiClientError } from "@/lib/api-client";
import { CallStatusBadge } from "./call-status-badge";

export interface CallDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallWithRelations | null;
  providerConfigured?: boolean;
  onDispatched?: (result: CallDispatchResult) => void;
}

export function CallDispatchModal({
  isOpen,
  onClose,
  call,
  providerConfigured = false,
  onDispatched,
}: CallDispatchModalProps) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<CallDispatchResult | null>(null);

  if (!call) return null;

  const isApproved = call.isApproved || call.status === "APPROVED";

  const handleDispatch = async () => {
    if (!call || !isApproved) return;

    setIsDispatching(true);
    setErrorMsg(null);

    try {
      const res = await api.voice.dispatchCall(call.id);
      if (res.data) {
        setDispatchResult(res.data);
        onDispatched?.(res.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Telephony provider dispatch rejected or failed.");
      }
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      title="Sensitive Operation: Outbound Call Dispatch"
      description="You are about to initiate an outbound call. This will trigger live telephony provider routing if configured."
    >
      {dispatchResult ? (
        <div className="p-4 rounded-lg bg-[#171717] border border-[#404040] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Dispatch Status:</span>
            <CallStatusBadge status={dispatchResult.status} />
          </div>
          {dispatchResult.providerCallId && (
            <p className="text-xs text-[#a3a3a3]">
              Provider Session: <span className="font-mono text-white">{dispatchResult.providerCallId}</span>
            </p>
          )}
          {dispatchResult.blockedReason && (
            <Alert variant="destructive" title="Dispatch Blocked by Safety Evaluator">
              {dispatchResult.blockedReason}
            </Alert>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive" title="Dispatch Failed">
              {errorMsg}
            </Alert>
          )}

          {!providerConfigured && (
            <Alert variant="warning" title="Provider Not Configured">
              Calling provider (Twilio PSTN) is not configured. The backend dispatch gate will safely block the call and prevent dialing.
            </Alert>
          )}

          {!isApproved && (
            <Alert variant="destructive" title="Human Approval Required">
              This call has not received explicit human approval. Outbound dispatch is locked until approved.
            </Alert>
          )}

          {/* Target Verification Grid */}
          <div className="p-3 bg-[#171717] border border-[#404040] rounded-lg divide-y divide-[#404040]/50 text-xs">
            <div className="py-2 flex justify-between">
              <span className="text-[#737373]">Target Lead:</span>
              <span className="font-medium text-white">{call.lead?.businessName || "Unknown"}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#737373]">Contact:</span>
              <span className="font-medium text-white">{call.contact?.fullName || "Primary"}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#737373]">Phone Number:</span>
              <span className="font-mono font-medium text-white">{call.normalizedPhone || call.recipientPhone}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#737373]">Objective:</span>
              <span className="text-white">{call.campaign?.targetOffer || call.campaign?.name || "Client Acquisition"}</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#737373]">Voice Agent:</span>
              <span className="text-white">{call.agentConfig?.name || "Default Closer"}</span>
            </div>
            <div className="py-2 flex justify-between items-center">
              <span className="text-[#737373]">Approval Status:</span>
              <CallStatusBadge status={call.status} size="sm" />
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#737373]">Provider State:</span>
              <span className={`font-semibold ${providerConfigured ? "text-emerald-400" : "text-amber-400"}`}>
                {providerConfigured ? "Configured & Ready" : "Unconfigured (Dry Run / Blocked)"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={isDispatching}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDispatch}
              disabled={isDispatching || !isApproved}
            >
              {isDispatching ? "Dispatching..." : "Confirm Outbound Dispatch"}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
