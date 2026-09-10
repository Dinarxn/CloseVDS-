"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ACQUISITION_OPERATING_STAGES } from "./dashboard-constants";

export function AcquisitionOperatingFlow() {
  return (
    <Card variant="standard" className="space-y-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Architecture Continuum
            </span>
            <span className="text-[10px] font-mono text-zinc-500">9-Stage Flow</span>
          </div>
        </div>
        <CardTitle>Acquisition Operating Flow</CardTitle>
        <CardDescription>
          Move prospects from discovery to conversion through controlled, observable stages.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACQUISITION_OPERATING_STAGES.map((stage) => (
            <div
              key={stage.stepNumber}
              className="p-4 bg-[#0d0d12] border border-white/[0.06] rounded-xl flex flex-col justify-between space-y-3 hover:border-white/[0.14] hover:bg-[#111118] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
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
                <h4 className="text-xs font-semibold text-white tracking-tight">
                  {stage.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {stage.route && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <Link
                    href={stage.route}
                    className="inline-flex items-center text-[11px] font-medium text-zinc-400 hover:text-white transition-colors gap-1"
                  >
                    <span>View Component</span>
                    <span className="text-zinc-500">→</span>
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
