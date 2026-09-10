"use client";

import React from "react";
import Link from "next/link";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeStyles: string;
  iconBg: string;
  icon: React.ReactNode;
  href: string;
  actionText: string;
}

export interface ActionRequiredProps {
  unqualifiedLeadsCount: number;
  pendingApprovalCallsCount: number;
  configuredProvidersCount: number;
  hasAgentConfig: boolean;
  isLoading: boolean;
}

export function ActionRequired({
  unqualifiedLeadsCount,
  pendingApprovalCallsCount,
  configuredProvidersCount,
  hasAgentConfig,
  isLoading,
}: ActionRequiredProps) {
  const actions: ActionItem[] = [];

  if (pendingApprovalCallsCount > 0) {
    actions.push({
      id: "pending_approvals",
      title: `${pendingApprovalCallsCount} Voice Call${pendingApprovalCallsCount > 1 ? "s" : ""} Awaiting Authorization`,
      description: "Human authorization required before the AI voice agent can initiate outbound contact.",
      badge: "High Priority",
      badgeStyles: "bg-red-500/10 text-red-400 border-red-500/20",
      iconBg: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      href: "/calling/calls",
      actionText: "Review Approvals",
    });
  }

  if (unqualifiedLeadsCount > 0) {
    actions.push({
      id: "unqualified_leads",
      title: `${unqualifiedLeadsCount} Prospect${unqualifiedLeadsCount > 1 ? "s" : ""} Ready for Qualification`,
      description: "New prospects discovered. Run website intelligence analysis and ICP relevance scoring.",
      badge: "Pipeline",
      badgeStyles: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      href: "/leads",
      actionText: "Qualify Prospects",
    });
  }

  if (configuredProvidersCount === 0) {
    actions.push({
      id: "no_providers",
      title: "Telephony Provider Not Configured",
      description: "Connect Twilio or Retell API credentials in telephony settings to activate outbound calling.",
      badge: "Setup",
      badgeStyles: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      href: "/calling/settings",
      actionText: "Configure Provider",
    });
  }

  if (!hasAgentConfig) {
    actions.push({
      id: "no_agent",
      title: "AI Voice Agent Profile Incomplete",
      description: "Define system instructions, verified knowledge guardrails, voice persona, and objection trees.",
      badge: "Setup",
      badgeStyles: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      ),
      href: "/calling/settings",
      actionText: "Configure Agent",
    });
  }

  // Always show closeBDS connection status
  actions.push({
    id: "closebds_pending",
    title: "closeBDS Discovery Sync Pending",
    description: "Automated prospect scraping and contact discovery engine ready for API link.",
    badge: "Integration",
    badgeStyles: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    href: "/settings",
    actionText: "View Settings",
  });

  return (
    <div className="rounded-xl p-5 bg-[#0c0c12] border border-white/[0.07] shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Operational Focus
            </span>
            {actions.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {actions.length} Pending
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold tracking-tight text-white">Action Required</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Critical operational milestones and permission gates requiring operator intervention.
          </p>
        </div>

        <Link
          href="/operations"
          className="group/link px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.18] text-xs font-mono text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
        >
          <span>Open Operations Queue</span>
          <span className="text-zinc-500 group-hover/link:text-white group-hover/link:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Action items */}
      <div className="space-y-2.5">
        {actions.length === 0 && !isLoading ? (
          <div className="p-6 text-center bg-[#0e0e16] border border-white/[0.06] rounded-lg space-y-1.5">
            <div className="w-8 h-8 mx-auto rounded-full bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-zinc-200">You&apos;re all caught up.</p>
            <p className="text-[11px] text-zinc-500">All safety gates, pipeline stages, and outreach approvals are operational.</p>
          </div>
        ) : (
          actions.map((act) => (
            <Link
              key={act.id}
              href={act.href}
              className="group p-3.5 bg-[#0e0e16] hover:bg-[#12121e] border border-white/[0.06] hover:border-white/[0.16] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150 cursor-pointer block hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${act.iconBg}`}>
                  {act.icon}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border font-semibold tracking-wider ${act.badgeStyles}`}>
                      {act.badge}
                    </span>
                    <h4 className="text-xs font-semibold text-white tracking-tight group-hover:text-white transition-colors">
                      {act.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
                    {act.description}
                  </p>
                </div>
              </div>

              {/* Real tactile button on the right */}
              <div className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md bg-white/[0.05] group-hover:bg-white text-zinc-300 group-hover:text-black border border-white/[0.08] group-hover:border-white transition-all shrink-0 self-end sm:self-center shadow-sm">
                <span>{act.actionText}</span>
                <span className="text-zinc-500 group-hover:text-black group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
