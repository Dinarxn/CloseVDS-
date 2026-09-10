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
      <span className="text-[#737373] text-xs">—</span>
    );
  }

  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  switch (outcome) {
    case "MEETING_REQUESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-950/60 text-emerald-200 border border-emerald-500/80 shadow-sm ${sizeClasses}`}
        >
          <span className="text-emerald-400 font-bold">★</span>
          Meeting Requested
        </span>
      );

    case "CALLBACK_REQUESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-cyan-950/50 text-cyan-200 border border-cyan-700/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Callback Requested
        </span>
      );

    case "INTERESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-950/40 text-blue-300 border border-blue-700/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Interested
        </span>
      );

    case "QUALIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-teal-950/40 text-teal-300 border border-teal-700/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          Qualified
        </span>
      );

    case "NOT_INTERESTED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#171717] text-[#a3a3a3] border border-[#404040] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
          Not Interested
        </span>
      );

    case "OPTED_OUT":
    case "DO_NOT_CALL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-red-950/80 text-red-200 border border-red-500 shadow-sm ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          {outcome === "OPTED_OUT" ? "Opted Out" : "Do Not Call"}
        </span>
      );

    case "DISQUALIFIED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-stone-900 text-stone-400 border border-stone-700 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
          Disqualified
        </span>
      );

    case "NO_ANSWER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-950/30 text-orange-300 border border-orange-800/60 ${sizeClasses}`}
        >
          No Answer
        </span>
      );

    case "BUSY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-950/30 text-orange-300 border border-orange-800/60 ${sizeClasses}`}
        >
          Busy
        </span>
      );

    case "VOICEMAIL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-950/30 text-purple-300 border border-purple-800/60 ${sizeClasses}`}
        >
          Voicemail
        </span>
      );

    case "FAILED":
    case "INVALID_NUMBER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-950/40 text-red-300 border border-red-800/80 ${sizeClasses}`}
        >
          {outcome === "INVALID_NUMBER" ? "Invalid Number" : "Call Failed"}
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#171717] text-[#a3a3a3] border border-[#404040] ${sizeClasses}`}
        >
          {outcome}
        </span>
      );
  }
}
