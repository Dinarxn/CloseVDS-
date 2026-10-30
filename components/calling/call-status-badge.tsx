"use client";

import React from "react";
import { CallStatus } from "@/types/calling";

export interface CallStatusBadgeProps {
  status: CallStatus;
  size?: "sm" | "md";
}

export function CallStatusBadge({ status, size = "md" }: CallStatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  switch (status) {
    case "APPROVAL_REQUIRED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Approval Required
        </span>
      );

    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-lime-500/15 text-[#C6FF33] border border-lime-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
          Approved
        </span>
      );

    case "QUEUED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08] font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          Queued
        </span>
      );

    case "SAFETY_CHECKING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-spin" />
          Safety Checking
        </span>
      );

    case "INITIATING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Initiating
        </span>
      );

    case "RINGING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Ringing
        </span>
      );

    case "IN_PROGRESS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-violet-500/20 text-white border border-violet-500/50 shadow-[0_0_12px_rgba(125,57,235,0.25)] font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] animate-ping" />
          In Progress
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
          Completed
        </span>
      );

    case "BLOCKED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Safety Blocked
        </span>
      );

    case "FAILED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Failed
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-elevated text-zinc-400 border border-white/[0.08] font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          Cancelled
        </span>
      );

    case "NO_ANSWER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          No Answer
        </span>
      );

    case "BUSY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Busy
        </span>
      );

    case "VOICEMAIL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          Voicemail
        </span>
      );

    case "OPTED_OUT":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          Opted Out (Suppressed)
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08] font-mono ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}
