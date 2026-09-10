"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LeadFilterState } from "@/types/leads";

export interface LeadsFiltersProps {
  filters: LeadFilterState;
  onChange: (field: keyof LeadFilterState, value: unknown) => void;
  onReset: () => void;
  onClose: () => void;
}

export function LeadsFilters({ filters, onChange, onReset, onClose }: LeadsFiltersProps) {
  return (
    <div className="p-4 bg-[#0d0d14] border border-white/[0.08] rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
          Lead Filter Criteria
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-zinc-400 hover:text-white">
            Reset all
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Input
          id="filter-location"
          label="Location"
          placeholder="e.g., London, Austin, CA"
          value={filters.location}
          onChange={(e) => onChange("location", e.target.value)}
          className="h-8 text-xs"
        />

        <Select
          id="filter-industry"
          label="Industry"
          value={filters.industry}
          onChange={(e) => onChange("industry", e.target.value)}
          options={[
            { value: "", label: "All Industries" },
            { value: "healthcare", label: "Healthcare & Clinics" },
            { value: "home_services", label: "Home & Field Services" },
            { value: "legal_financial", label: "Legal & Financial" },
            { value: "technology", label: "Technology & Software" },
            { value: "ecommerce", label: "E-Commerce & Retail" },
          ]}
          className="h-8 text-xs py-1"
        />

        <Select
          id="filter-size"
          label="Company Size"
          value={filters.companySize}
          onChange={(e) => onChange("companySize", e.target.value)}
          options={[
            { value: "", label: "All Sizes" },
            { value: "1-10", label: "1-10 Employees" },
            { value: "11-50", label: "11-50 Employees" },
            { value: "51-200", label: "51-200 Employees" },
            { value: "201+", label: "201+ Employees" },
          ]}
          className="h-8 text-xs py-1"
        />

        <Select
          id="filter-status"
          label="Status"
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
          options={[
            { value: "", label: "All Statuses" },
            { value: "discovered", label: "Discovered" },
            { value: "qualified", label: "Qualified" },
            { value: "outreach_ready", label: "Outreach Ready" },
            { value: "contacted", label: "Contacted" },
            { value: "replied", label: "Replied" },
            { value: "opted_out", label: "Opted Out" },
          ]}
          className="h-8 text-xs py-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <Select
          id="filter-source"
          label="Discovery Source"
          value={filters.source}
          onChange={(e) => onChange("source", e.target.value)}
          options={[
            { value: "", label: "All Sources" },
            { value: "google_maps", label: "Google Maps API" },
            { value: "domain_search", label: "Domain Search" },
            { value: "directory", label: "B2B Directory" },
            { value: "inbound", label: "Inbound Capture" },
          ]}
          className="h-8 text-xs py-1"
        />

        <Select
          id="filter-qualification"
          label="Min. AI Qualification Score"
          value={String(filters.minScore)}
          onChange={(e) => onChange("minScore", Number(e.target.value))}
          options={[
            { value: "0", label: "Any Score (0+)" },
            { value: "50", label: "Score >= 50" },
            { value: "70", label: "Score >= 70 (Qualified)" },
            { value: "85", label: "Score >= 85 (High Priority)" },
          ]}
          className="h-8 text-xs py-1"
        />

        <Select
          id="filter-call-readiness"
          label="Call Readiness"
          value={filters.campaign}
          onChange={(e) => onChange("campaign", e.target.value)}
          options={[
            { value: "", label: "All Prospects" },
            { value: "ready", label: "Call Ready (Qualified)" },
            { value: "new", label: "Needs Research / Discovery" },
          ]}
          className="h-8 text-xs py-1"
        />
      </div>
    </div>
  );
}
