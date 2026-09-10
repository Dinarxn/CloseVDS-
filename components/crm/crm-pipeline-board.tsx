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
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Filter pipeline by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-[#0a0a0a] text-white text-xs rounded-md border border-[#404040] placeholder-[#737373] focus:outline-none focus:border-white transition-colors"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#737373]">
            <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        <div className="text-xs text-[#737373]">
          <span>Acquisition Lifecycle: </span>
          <span className="text-[#d4d4d4] font-medium">7 Lifecycle Stages</span>
        </div>
      </div>

      {/* Horizontal Scrolling Kanban Canvas */}
      <div className="overflow-x-auto pb-4">
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
