import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT / BRAND PANEL (Desktop 2-col, Mobile top banner) */}
      <div className="w-full lg:w-5/12 bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-[#404040] p-6 lg:p-12 flex flex-col justify-between space-y-8">
        {/* Brand Header */}
        <div className="space-y-6">
          <Link href="/dashboard" className="inline-flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-white text-black font-bold flex items-center justify-center text-xs tracking-tighter">
              VDS
            </div>
            <span className="font-bold text-white text-xl tracking-tight">closeVDS</span>
          </Link>

          <div className="space-y-2 pt-4">
            <Badge variant="secondary">AI Client Acquisition OS</Badge>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Find. Qualify. Reach. Close.
            </h2>
            <p className="text-xs text-[#737373] leading-relaxed max-w-md">
              Enterprise B2B client acquisition system for discovering qualified prospects, auditing digital opportunities, and conducting personalized outreach.
            </p>
          </div>
        </div>

        {/* Informational Security & Safety Safeguards */}
        <div className="hidden lg:block space-y-4 pt-8 border-t border-[#404040]/50">
          <p className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider">
            Enterprise Architecture
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">Outreach Safety Controls</p>
                <p className="text-[#737373] text-[11px]">Strict sending limits & CAN-SPAM compliance.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white mt-1 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-white">AI Fact Verification</p>
                <p className="text-[#737373] text-[11px]">Personalization grounded in verified lead data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#404040]">
          <span>closeVDS OS • Phase 1 Foundation</span>
        </div>
      </div>

      {/* RIGHT / FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
