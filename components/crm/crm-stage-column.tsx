import React from "react";
import { Badge } from "@/components/ui/badge";
import { CrmDealItem, CrmStageConfig } from "@/types/crm";

export interface CrmStageColumnProps {
  stage: CrmStageConfig;
  deals: CrmDealItem[];
  onSelectDeal?: (deal: CrmDealItem) => void;
}

export function CrmStageColumn({ stage, deals, onSelectDeal }: CrmStageColumnProps) {
  return (
    <div className="flex-1 min-w-[260px] max-w-[320px] bg-[#171717] border border-[#404040] rounded-lg flex flex-col max-h-[750px]">
      {/* Column Header */}
      <div className="p-3.5 border-b border-[#404040]/60 bg-[#0a0a0a] rounded-t-lg space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {stage.label}
          </span>
          <Badge variant={deals.length > 0 ? "solid" : "outline"} className="text-[10px] px-1.5 py-0">
            {deals.length}
          </Badge>
        </div>
        <p className="text-[10px] text-[#737373] line-clamp-1 leading-snug">
          {stage.description}
        </p>
      </div>

      {/* Deals Container / Empty Indicator */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {deals.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#404040]/40 rounded-md">
            <span className="text-[11px] text-[#737373]">No prospects</span>
          </div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onSelectDeal?.(deal)}
              className="p-3 bg-[#0a0a0a] border border-[#404040] rounded-md hover:border-white transition-colors cursor-pointer space-y-2 text-xs"
            >
              <div className="font-semibold text-white">{deal.companyName}</div>
              {deal.contactName && <div className="text-[11px] text-[#737373]">{deal.contactName}</div>}
              {deal.qualificationScore !== undefined && (
                <div className="pt-1">
                  <Badge variant="outline" className="text-[10px]">
                    Score {deal.qualificationScore}/100
                  </Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
