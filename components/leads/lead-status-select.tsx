"use client";

import React, { useState, useRef, useEffect } from "react";
import { LeadStatus } from "@/types/leads";
import { LeadStatusBadge } from "./lead-status-badge";
import { mapLeadStatusToBackendStatus, mapBackendStatusToLeadStatus } from "@/lib/mappers";
import { api, ApiClientError } from "@/lib/api-client";

export interface LeadStatusSelectProps {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange?: (newStatus: LeadStatus) => void;
  size?: "sm" | "default";
  disabled?: boolean;
  className?: string;
  showDropdownArrow?: boolean;
}

export const CANONICAL_STATUS_OPTIONS: Array<{
  value: LeadStatus;
  label: string;
  stageName: string;
  colorDot: string;
}> = [
  { value: "discovered", label: "Discovered", stageName: "Discovery & Intake", colorDot: "bg-zinc-400" },
  { value: "analyzing", label: "Auditing", stageName: "Research & Audit", colorDot: "bg-amber-400" },
  { value: "qualified", label: "Qualified", stageName: "Qualification", colorDot: "bg-[#C6FF33]" },
  { value: "outreach_ready", label: "Call Ready", stageName: "Calling & Outreach", colorDot: "bg-[#7D39EB]" },
  { value: "contacted", label: "Contacted", stageName: "Calling & Outreach", colorDot: "bg-indigo-400" },
  { value: "in_followup", label: "In Follow-up", stageName: "Conversion & Followup", colorDot: "bg-amber-400" },
  { value: "replied", label: "Replied", stageName: "Conversion & Followup", colorDot: "bg-[#C6FF33]" },
  { value: "meeting_booked", label: "Meeting Booked", stageName: "Conversion & Followup", colorDot: "bg-[#C6FF33]" },
  { value: "closed_won", label: "Closed Won", stageName: "Closed Deal", colorDot: "bg-[#C6FF33]" },
  { value: "closed_lost", label: "Closed Lost", stageName: "Closed Deal", colorDot: "bg-zinc-500" },
  { value: "disqualified", label: "Disqualified", stageName: "Disqualified", colorDot: "bg-zinc-500" },
  { value: "opted_out", label: "Opted Out", stageName: "Suppressed (Regulatory)", colorDot: "bg-rose-400" },
];

export function LeadStatusSelect({
  leadId,
  currentStatus,
  onStatusChange,
  size = "default",
  disabled = false,
  className = "",
  showDropdownArrow = true,
}: LeadStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Dismiss error message after 5 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const handleSelectStatus = async (newStatus: LeadStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }
    if (isUpdating || disabled) return;

    setIsUpdating(true);
    setErrorMessage(null);
    setIsOpen(false);

    try {
      const backendStatus = mapLeadStatusToBackendStatus(newStatus);
      // Persist through the authoritative CRM stage transition endpoint
      const response = await api.crm.updateStage(leadId, {
        status: backendStatus,
      });

      if (response?.lead) {
        const persistedStatus = mapBackendStatusToLeadStatus(response.lead.status);
        onStatusChange?.(persistedStatus);
      } else {
        onStatusChange?.(newStatus);
      }
    } catch (err: unknown) {
      let msg = "Failed to update lead status.";
      if (err instanceof ApiClientError) {
        msg = err.message || `Status update rejected (HTTP ${err.statusCode}).`;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
      // Status is preserved/restored as currentStatus on failure
    } finally {
      setIsUpdating(false);
    }
  };

  const isSmall = size === "sm";
  const isTerminalOptOut = currentStatus === "opted_out";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isUpdating || isTerminalOptOut}
        onClick={() => {
          if (!disabled && !isUpdating && !isTerminalOptOut) {
            setIsOpen((prev) => !prev);
          }
        }}
        aria-label={`Change status for lead ${leadId}. Current: ${currentStatus}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={
          isTerminalOptOut
            ? "Regulatory suppression boundary active: Opted Out leads cannot be transitioned"
            : "Click to change status"
        }
        className={`group inline-flex items-center gap-1.5 rounded-lg transition-all ${
          isTerminalOptOut ? "cursor-not-allowed opacity-75" : "cursor-pointer"
        } disabled:opacity-50 disabled:cursor-not-allowed ${
          isSmall ? "p-0.5" : "p-1"
        } hover:bg-[#1D1D28] border border-transparent hover:border-white/[0.12] focus:outline-none focus:ring-1 focus:ring-[#7D39EB]`}
      >
        {isUpdating ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono tracking-tight font-medium bg-white/[0.04] border-white/[0.1] text-zinc-300">
            <span className="w-2.5 h-2.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Updating...</span>
          </span>
        ) : (
          <LeadStatusBadge status={currentStatus} />
        )}

        {showDropdownArrow && !isUpdating && !isTerminalOptOut && (
          <svg
            className={`w-3 h-3 text-[#8E8E9F] group-hover:text-white transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Floating Error Tooltip */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute z-50 left-0 top-full mt-1.5 w-64 p-2.5 rounded-lg bg-[#14080c] border border-rose-500/40 text-rose-200 text-xs shadow-xl backdrop-blur-md space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-start justify-between gap-1">
            <span className="font-semibold text-rose-300 text-[11px] font-mono uppercase tracking-wide">
              Transition Error
            </span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 text-xs cursor-pointer"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] leading-snug font-sans text-rose-200/90">{errorMessage}</p>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select lead stage"
          className="absolute z-50 left-0 top-full mt-1.5 w-56 max-h-72 overflow-y-auto rounded-xl bg-[#0A0A0E] border border-white/[0.14] shadow-[0_16px_36px_rgba(0,0,0,0.85)] py-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 divide-y divide-white/[0.05]"
        >
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#8E8E9F] font-semibold bg-white/[0.02]">
            Move Stage / Status
          </div>

          <div className="py-1">
            {CANONICAL_STATUS_OPTIONS.map((opt) => {
              const isSelected = opt.value === currentStatus;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectStatus(opt.value)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#7D39EB]/15 text-white font-medium"
                      : "text-[#CBCBD6] hover:bg-[#171720] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.colorDot}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[#C6FF33] text-xs font-mono font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
