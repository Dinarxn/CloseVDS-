"use client";

import React from "react";
import { CallOutcomeType } from "@/types/calling";

export interface CallOutcomeBadgeProps {
  outcome?: CallOutcomeType | null;
  size?: "sm" | "md";
}

export function CallOutcomeBadge({ outcome, size = "md" }: CallOutcomeBadgeProps) {
  if (!outcome) {
    return (
      <span className="text-zinc-500 font-mono text-xs">—</span>
    );
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  switch (outcome) {
    case "MEETING_REQUESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-lime-500/15 text-[#C6FF33] border border-lime-500/40 shadow-xs font-mono ${sizeClasses}`}
        >
          <span className="text-[#C6FF33] font-bold">★</span>
          Meeting Requested
        </span>
      );

    case "CALLBACK_REQUESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/35 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          Callback Requested
        </span>
      );

    case "INTERESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/10 text-violet-200 border border-violet-500/25 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          Interested
        </span>
      );

    case "QUALIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-lime-500/10 text-[#C6FF33] border border-lime-500/25 font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33]" />
          Qualified
        </span>
      );

    case "NOT_INTERESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-elevated text-zinc-400 border border-white/[0.08] font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          Not Interested
        </span>
      );

    case "OPTED_OUT":
    case "DO_NOT_CALL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/40 shadow-xs font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          {outcome === "OPTED_OUT" ? "Opted Out" : "Do Not Call"}
        </span>
      );

    case "DISQUALIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-panel text-zinc-400 border border-white/[0.08] font-mono ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          Disqualified
        </span>
      );

    case "NO_ANSWER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono ${sizeClasses}`}
        >
          No Answer
        </span>
      );

    case "BUSY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-mono ${sizeClasses}`}
        >
          Busy
        </span>
      );

    case "VOICEMAIL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25 font-mono ${sizeClasses}`}
        >
          Voicemail
        </span>
      );

    case "FAILED":
    case "INVALID_NUMBER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono ${sizeClasses}`}
        >
          {outcome === "INVALID_NUMBER" ? "Invalid Number" : "Call Failed"}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-surface-elevated text-zinc-300 border border-white/[0.08] font-mono ${sizeClasses}`}
        >
          {outcome}
        </span>
      );
  }
}
