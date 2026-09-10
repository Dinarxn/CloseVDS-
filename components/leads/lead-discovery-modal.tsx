"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { api, ApiClientError } from "@/lib/api-client";

export interface LeadDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDiscoveryModal({ isOpen, onClose }: LeadDiscoveryModalProps) {
  const [niche, setNiche] = useState("");
  const [location, setLocation] = useState("");
  const [batchSize, setBatchSize] = useState("10");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleQueueDiscovery = async () => {
    if (!niche.trim() || !location.trim()) {
      setStatusMessage({
        type: "error",
        text: "Please provide both a target niche and geographic market.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await api.post<{
        data: { discovered: number; candidates: Array<{ businessName: string }> };
      }>("/lead-discovery/query", {
        niche: niche.trim(),
        location: location.trim(),
        limit: parseInt(batchSize, 10) || 10,
      });

      const count = response?.data?.discovered || 0;
      setStatusMessage({
        type: "success",
        text: `Successfully discovered and normalized ${count} candidate businesses into your leads workspace.`,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.code === "PROVIDER_UNAVAILABLE" || err.statusCode === 503) {
          setStatusMessage({
            type: "info",
            text: "Lead Discovery provider (SerpAPI/Google Maps) is unconfigured or in safe standby mode. You can configure your provider key in Workspace Settings.",
          });
        } else {
          setStatusMessage({
            type: "error",
            text: err.message || "Failed to execute lead discovery query.",
          });
        }
      } else {
        setStatusMessage({
          type: "error",
          text: "Network error while connecting to discovery service.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Initiate Lead Discovery Workflow"
      description="Specify the niche, geographic market, and candidate volume to queue prospective businesses for automated gap analysis."
    >
      <div className="space-y-4">
        {statusMessage && (
          <Alert
            variant={
              statusMessage.type === "error"
                ? "destructive"
                : statusMessage.type === "info"
                ? "warning"
                : "default"
            }
            title={
              statusMessage.type === "error"
                ? "Discovery Notice"
                : statusMessage.type === "info"
                ? "Provider Standby"
                : "Discovery Completed"
            }
          >
            {statusMessage.text}
          </Alert>
        )}

        <div className="space-y-3">
          <Input
            id="modal-discovery-niche"
            label="Target Niche / Vertical"
            placeholder="e.g., Dental Practice, HVAC Contractor, MedSpa"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            helperText="Directs search queries to businesses offering these specific services."
            disabled={isSubmitting}
          />

          <Input
            id="modal-discovery-location"
            label="Geographic Search Area"
            placeholder="e.g., Dallas, TX or London, UK"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            helperText="Limits discovery radius to candidate businesses located in this region."
            disabled={isSubmitting}
          />

          <Select
            id="modal-discovery-batch"
            label="Discovery Candidate Batch Size"
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            options={[
              { value: "10", label: "10 candidate businesses (Small test batch)" },
              { value: "25", label: "25 candidate businesses (Standard batch)" },
              { value: "50", label: "50 candidate businesses (Max daily MVP cap)" },
            ]}
            helperText="Number of raw listings to fetch and run through 4-factor deduplication."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#404040]/40">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleQueueDiscovery}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Discovering..." : "Queue Discovery"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
