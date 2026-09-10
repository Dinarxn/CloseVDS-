"use client";

import React from "react";
import { CallStatus } from "@/types/calling";

export interface CallStatusBadgeProps {
  status: CallStatus;
  size?: "sm" | "md";
}

export function CallStatusBadge({ status, size = "md" }: CallStatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  switch (status) {
    case "APPROVAL_REQUIRED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Approval Required
        </span>
      );

    case "APPROVED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Approved
        </span>
      );

    case "QUEUED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#171717] text-[#a3a3a3] border border-[#404040] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
          Queued
        </span>
      );

    case "SAFETY_CHECKING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-950/40 text-sky-300 border border-sky-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-spin" />
          Safety Checking
        </span>
      );

    case "INITIATING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-950/40 text-blue-300 border border-blue-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Initiating
        </span>
      );

    case "RINGING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-950/40 text-blue-300 border border-blue-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Ringing
        </span>
      );

    case "IN_PROGRESS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          In Progress
        </span>
      );

    case "COMPLETED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-950/30 text-emerald-300 border border-emerald-800/60 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Completed
        </span>
      );

    case "BLOCKED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Safety Blocked
        </span>
      );

    case "FAILED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-red-950/40 text-red-300 border border-red-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Failed
        </span>
      );

    case "CANCELLED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#171717] text-[#737373] border border-[#404040] ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#737373]" />
          Cancelled
        </span>
      );

    case "NO_ANSWER":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-950/40 text-orange-300 border border-orange-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          No Answer
        </span>
      );

    case "BUSY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-orange-950/40 text-orange-300 border border-orange-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          Busy
        </span>
      );

    case "VOICEMAIL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-950/40 text-purple-300 border border-purple-800/80 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          Voicemail
        </span>
      );

    case "OPTED_OUT":
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-red-900/60 text-red-100 border border-red-600 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Opted Out (Suppressed)
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-[#171717] text-[#a3a3a3] border border-[#404040] ${sizeClasses}`}
        >
          {status}
        </span>
      );
  }
}
