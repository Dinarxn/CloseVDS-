"use client";

import React, { useState } from "react";
import { CRM_STAGES } from "./crm-constants";
import { CrmStageColumn } from "./crm-stage-column";
import { CrmDealItem } from "@/types/crm";

export interface CrmPipelineBoardProps {
  deals?: CrmDealItem[];
}

export function CrmPipelineBoard({ deals = [] }: CrmPipelineBoardProps) {
  const [search, setSearch] = useState("");

  const filteredDeals = deals.filter((d) =>
    d.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (d.contactName && d.contactName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Board Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Filter pipeline by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8.5 pl-8 pr-3 bg-[#09090f] text-zinc-100 text-xs rounded-lg border border-white/[0.08] placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors shadow-xs"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-zinc-500">
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
            Acquisition Lifecycle
          </span>
          <span className="text-zinc-600 font-mono text-[10px]">•</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08] font-medium">
            7 Lifecycle Stages
          </span>
        </div>
      </div>

      {/* Horizontal Scrolling Kanban Canvas */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex items-start space-x-3.5 min-w-[1400px]">
          {CRM_STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            return (
              <CrmStageColumn
                key={stage.id}
                stage={stage}
                deals={stageDeals}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
