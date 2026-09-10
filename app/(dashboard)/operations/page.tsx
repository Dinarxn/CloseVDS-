"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";

interface CallsResponsePayload {
  calls?: CallItem[];
  data?: { calls?: CallItem[] };
}

interface LeadsResponsePayload {
  items?: LeadItem[];
  data?: { items?: LeadItem[] };
}

type OperationCategory =
  | "all"
  | "approvals"
  | "calling"
  | "research"
  | "qualification"
  | "followup"
  | "crm"
  | "system";

interface OperationTask {
  id: string;
  category: OperationCategory;
  title: string;
  target: string;
  reason: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE";
  timestamp: string;
  actionText: string;
  actionHref: string;
  metadata?: string;
}

interface LeadItem {
  id: string;
  businessName: string;
  domain?: string;
  status: string;
  createdAt: string;
  leadScore?: { finalScore?: number } | null;
}

interface CallItem {
  id: string;
  leadId: string;
  status: string;
  createdAt: string;
  lead?: { businessName?: string } | null;
  outcome?: { outcomeType?: string; notes?: string } | null;
}

export default function OperationsPage() {
  const [selectedFilter, setSelectedFilter] = useState<OperationCategory>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<OperationTask[]>([]);

  const loadOperations = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadsRes, callsRes, providersRes, agentsRes] = await Promise.allSettled([
        api.get<{ items?: LeadItem[]; data?: { items?: LeadItem[] } }>("/leads?limit=100"),
        api.voice.listCalls({ limit: 100 }),
        api.settings.getProviders(),
        api.voice.getAgentConfigs(),
      ]);

      const items: OperationTask[] = [];

      // 1. Process Voice Calls for Approvals & Call Ready
      if (callsRes.status === "fulfilled") {
        const val = callsRes.value as unknown as CallsResponsePayload;
        const rawCalls: CallItem[] = Array.isArray(val?.calls)
          ? val.calls
          : Array.isArray(val?.data?.calls)
          ? val.data.calls
          : [];

        // Approvals required
        const pendingCalls = rawCalls.filter((c) => c.status === "APPROVAL_REQUIRED");
        if (pendingCalls.length > 0) {
          pendingCalls.forEach((call) => {
            items.push({
              id: `call-approval-${call.id}`,
              category: "approvals",
              title: "Outbound Voice Call Authorization Required",
              target: call.lead?.businessName || "Prospect",
              reason: "AI dialogue script, target phone, and grounded facts prepared. Awaiting operator authorization.",
              priority: "CRITICAL",
              timestamp: formatTime(call.createdAt),
              actionText: "Review & Authorize",
              actionHref: `/calling/calls`,
              metadata: "Approval Gate",
            });
          });
        }

        // Follow-ups due from outcomes
        const callbackCalls = rawCalls.filter(
          (c) =>
            c.outcome?.outcomeType === "CALLBACK_REQUESTED" ||
            c.outcome?.outcomeType === "INTERESTED"
        );
        if (callbackCalls.length > 0) {
          callbackCalls.forEach((call) => {
            items.push({
              id: `followup-${call.id}`,
              category: "followup",
              title:
                call.outcome?.outcomeType === "CALLBACK_REQUESTED"
                  ? "Callback Requested by Prospect"
                  : "Interested Lead Disposition",
              target: call.lead?.businessName || "Prospect",
              reason: call.outcome?.notes || "Positive response detected during call. Operator callback needed.",
              priority: "HIGH",
              timestamp: formatTime(call.createdAt),
              actionText: "Open Follow-Up",
              actionHref: `/crm`,
              metadata: call.outcome?.outcomeType || "Follow-up",
            });
          });
        }
      }

      // 2. Process Leads for Research & Qualification
      if (leadsRes.status === "fulfilled") {
        const val = leadsRes.value as unknown as LeadsResponsePayload;
        const rawLeads: LeadItem[] = Array.isArray(val?.items)
          ? val.items
          : Array.isArray(val?.data?.items)
          ? val.data.items
          : [];

        // Needs research (new leads without audit score)
        const unresearched = rawLeads.filter(
          (l) => l.status === "NEW" && !l.leadScore
        );
        if (unresearched.length > 0) {
          items.push({
            id: "batch-research",
            category: "research",
            title: `${unresearched.length} Discovered Lead${unresearched.length > 1 ? "s" : ""} Need Research`,
            target: unresearched.slice(0, 3).map((l) => l.businessName).join(", ") + (unresearched.length > 3 ? "..." : ""),
            reason: "Website infrastructure, mobile deficits, and tech stack intelligence pending discovery audit.",
            priority: "HIGH",
            timestamp: formatTime(unresearched[0]?.createdAt),
            actionText: "Open Research Queue",
            actionHref: "/leads",
            metadata: `${unresearched.length} Pending`,
          });
        }

        // Needs qualification (leads scored or newly imported ready for review)
        const toQualify = rawLeads.filter((l) => l.status === "NEW" && l.leadScore);
        if (toQualify.length > 0) {
          items.push({
            id: "batch-qualification",
            category: "qualification",
            title: `${toQualify.length} Researched Lead${toQualify.length > 1 ? "s" : ""} Awaiting Qualification`,
            target: toQualify.slice(0, 3).map((l) => l.businessName).join(", ") + (toQualify.length > 3 ? "..." : ""),
            reason: "Dual fact verification and ICP fit threshold scoring ready for evaluation.",
            priority: "MEDIUM",
            timestamp: formatTime(toQualify[0]?.createdAt),
            actionText: "Review & Qualify",
            actionHref: "/leads",
            metadata: "ICP Verification",
          });
        }

        // Call Ready prospects (qualified leads ready for voice call preparation)
        const qualified = rawLeads.filter((l) => l.status === "QUALIFIED");
        if (qualified.length > 0) {
          items.push({
            id: "batch-call-ready",
            category: "calling",
            title: `${qualified.length} Qualified Prospect${qualified.length > 1 ? "s" : ""} Ready for Call Preparation`,
            target: qualified.slice(0, 3).map((l) => l.businessName).join(", ") + (qualified.length > 3 ? "..." : ""),
            reason: "Passed qualification gates. Ground facts and queue for AI voice agent outbound session.",
            priority: "HIGH",
            timestamp: formatTime(qualified[0]?.createdAt),
            actionText: "Open Call Queue",
            actionHref: "/calling/calls",
            metadata: "Ready to Call",
          });
        }
      }

      // 3. System Configuration Issues
      if (providersRes.status === "fulfilled") {
        const providers = providersRes.value?.providers || [];
        const configuredCount = providers.filter((p) => p.isConfigured).length;
        if (configuredCount === 0) {
          items.push({
            id: "system-no-telephony",
            category: "system",
            title: "Voice Telephony Provider Not Configured",
            target: "Twilio / Retell Carrier Integration",
            reason: "No active voice provider credentials found. Live outbound voice calls are blocked until configured.",
            priority: "CRITICAL",
            timestamp: "Persistent",
            actionText: "Configure Telephony",
            actionHref: "/calling/settings",
            metadata: "Telephony Gateway",
          });
        }
      }

      if (agentsRes.status === "fulfilled") {
        const agentConfigs = agentsRes.value?.data || [];
        if (agentConfigs.length === 0) {
          items.push({
            id: "system-no-agent",
            category: "system",
            title: "AI Voice Agent Persona Unconfigured",
            target: "Agent Dialogue & Safety Guardrails",
            reason: "No AI voice agent profile found. Configure dialogue prompt, voice model, and knowledge boundaries.",
            priority: "CRITICAL",
            timestamp: "Persistent",
            actionText: "Configure Voice Agent",
            actionHref: "/calling/settings",
            metadata: "Agent Enclosure",
          });
        }
      }

      // Always show closeBDS discovery connection status
      items.push({
        id: "system-closebds",
        category: "system",
        title: "closeBDS Automated Discovery Sync Pending",
        target: "External Prospect Scraping Pipeline",
        reason: "closeBDS connects external scraper feeds into closeVDS Lead Pool. Configuration ready for setup.",
        priority: "ROUTINE",
        timestamp: "Standby",
        actionText: "Connection Settings",
        actionHref: "/settings",
        metadata: "Discovery Source",
      });

      setTasks(items);
    } catch {
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  function formatTime(isoString?: string) {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return "Recently";
    }
  }

  const filteredTasks = useMemo(() => {
    if (selectedFilter === "all") return tasks;
    return tasks.filter((t) => t.category === selectedFilter);
  }, [tasks, selectedFilter]);

  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      all: tasks.length,
      approvals: 0,
      calling: 0,
      research: 0,
      qualification: 0,
      followup: 0,
      crm: 0,
      system: 0,
    };
    tasks.forEach((t) => {
      if (counts[t.category] !== undefined) {
        counts[t.category]++;
      }
    });
    return counts;
  }, [tasks]);

  const filterTabs: Array<{ id: OperationCategory; label: string; countKey: string }> = [
    { id: "all", label: "All Operations", countKey: "all" },
    { id: "approvals", label: "Approvals", countKey: "approvals" },
    { id: "calling", label: "Call Ready", countKey: "calling" },
    { id: "research", label: "Needs Research", countKey: "research" },
    { id: "qualification", label: "Qualification", countKey: "qualification" },
    { id: "followup", label: "Follow-Up", countKey: "followup" },
    { id: "system", label: "System Health", countKey: "system" },
  ];

  const getPriorityBadgeVariant = (priority: OperationTask["priority"]) => {
    switch (priority) {
      case "CRITICAL":
        return "danger" as const;
      case "HIGH":
        return "warning" as const;
      case "MEDIUM":
        return "info" as const;
      case "ROUTINE":
        return "secondary" as const;
    }
  };

  return (
    <PageContainer maxWidth="xl" className="space-y-6">
      {/* SECTION 1: Operations Header */}
      <PageHeader
        title="Operations"
        description="Unified operator work queue. Review approvals, prepare calls, inspect prospect research, and clear system blockers."
        breadcrumbs={[
          { label: "closeVDS", href: "/dashboard" },
          { label: "Operations" },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <Link href="/leads">
              <Button variant="secondary" size="sm" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Lead Pool</span>
              </Button>
            </Link>
            <Link href="/calling/calls">
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span>Call Queue</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* SECTION 2: Work Queue Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/[0.06]">
        {filterTabs.map((tab) => {
          const active = selectedFilter === tab.id;
          const count = countsByCategory[tab.countKey] || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 shrink-0 cursor-pointer ${
                active
                  ? "bg-white/[0.12] text-white border border-white/[0.14] shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  active
                    ? "bg-white/[0.2] text-white font-bold"
                    : "bg-white/[0.06] text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SECTION 3: Operations Work Queue List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Actionable Work Items
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            {isLoading ? "Fetching operations..." : `${filteredTasks.length} Task${filteredTasks.length === 1 ? "" : "s"} in Queue`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center border border-white/[0.08] rounded-xl bg-[#0f0f16] space-y-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400 font-mono">Synchronizing operator queues...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card variant="standard" className="p-12 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">No tasks pending in this queue</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                All items in this queue have been handled or cleared by active safety gates.
              </p>
            </div>
            <div className="pt-2">
              <Button size="sm" variant="secondary" onClick={() => setSelectedFilter("all")}>
                View All Operations
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                variant="interactive"
                className="p-4 bg-[#0d0d14] border border-white/[0.08] hover:border-white/[0.18] rounded-xl transition-all duration-150 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={getPriorityBadgeVariant(task.priority)}
                        size="sm"
                        className="font-mono text-[9px] font-bold"
                      >
                        {task.priority}
                      </Badge>
                      {task.metadata && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400 border border-white/[0.04]">
                          {task.metadata}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-zinc-500">
                        {task.timestamp}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-white">
                      {task.title}
                    </h3>

                    <p className="text-xs text-zinc-300">
                      Target: <span className="font-semibold text-white">{task.target}</span>
                    </p>

                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                      {task.reason}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Link href={task.actionHref}>
                      <Button
                        size="sm"
                        variant={task.priority === "CRITICAL" ? "primary" : "secondary"}
                        className="text-xs flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <span>{task.actionText}</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
