"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACQUISITION_OPERATING_STAGES } from "./dashboard-constants";

export function AcquisitionOperatingFlow() {
  return (
    <Card variant="standard" className="space-y-4 bg-surface-panel border-white/[0.08]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8E9F] font-semibold">
              Architecture Continuum
            </span>
            <span className="text-[10px] font-mono text-[#8E8E9F]">9-Stage Flow</span>
          </div>
        </div>
        <CardTitle className="text-white">Acquisition Operating Flow</CardTitle>
        <CardDescription className="text-[#8E8E9F]">
          Move prospects from discovery to conversion through controlled, observable stages.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACQUISITION_OPERATING_STAGES.map((stage) => (
            <div
              key={stage.stepNumber}
              className="p-4 bg-surface-card border border-white/[0.06] rounded-xl flex flex-col justify-between space-y-3 hover:border-white/[0.14] hover:bg-surface-card-hover transition-all relative overflow-hidden group shadow-xs"
            >
              {/* Specular hairline on hover */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#8E8E9F] uppercase font-semibold">
                    Stage 0{stage.stepNumber}
                  </span>
                  <Badge
                    variant={stage.statusVariant}
                    size="sm"
                    className="font-mono text-[9px]"
                  >
                    {stage.statusTag}
                  </Badge>
                </div>
                <h4 className="text-xs font-semibold text-white tracking-tight group-hover:text-white transition-colors">
                  {stage.title}
                </h4>
                <p className="text-xs text-[#8E8E9F] leading-relaxed group-hover:text-[#CBCBD6] transition-colors">
                  {stage.description}
                </p>
              </div>

              {stage.route && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <Link
                    href={stage.route}
                    className="inline-flex items-center text-[11px] font-medium text-[#8E8E9F] hover:text-[#B788FF] transition-colors gap-1"
                  >
                    <span>View Component</span>
                    <span className="text-[#565668]">→</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
