"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type NavItem } from "@/components/navigation/navigation-items";
import { SafetyShield } from "@/components/layout/safety-shield";
import { useAuth } from "@/hooks/use-auth";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const PIPELINE_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", isExact: true },
  { id: "leads", label: "Leads & Import", href: "/leads" },
  { id: "crm", label: "Sales Pipeline", href: "/crm" },
  { id: "operations", label: "Tasks & Follow-ups", href: "/operations" },
  { id: "outreach", label: "Outreach Center", href: "/outreach" },
  { id: "analytics", label: "Analytics", href: "/analytics" },
];

const CALLING_NAV_ITEMS: NavItem[] = [
  { id: "calling-overview", label: "Calling Overview", href: "/calling", isExact: true },
  { id: "calling-calls", label: "Call Queue & History", href: "/calling/calls" },
  { id: "calling-agents", label: "Voice Agents", href: "/calling/agents" },
  { id: "calling-settings", label: "Telephony & Providers", href: "/calling/settings" },
];

const SYSTEM_NAV_ITEMS: NavItem[] = [
  { id: "settings", label: "Settings & Integrations", href: "/settings" },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspace, logout } = useAuth();

  const isItemActive = (href: string, isExact?: boolean) => {
    if (!pathname) return false;
    if (isExact || href === "/dashboard" || href === "/calling") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "WS";

  // Visual SVG icons for navigation items (16px, crisp 1.75 stroke width)
  const renderNavIcon = (id: string, active: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 transition-all duration-150 ${
      active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
    }`;

    switch (id) {
      case "dashboard":
      case "overview":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
            />
          </svg>
        );
      case "leads":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "crm":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        );
      case "operations":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        );
      case "outreach":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        );
      case "analytics":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case "calling-overview":
      case "calling":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"
            />
          </svg>
        );
      case "calling-calls":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M14 7h6m-6 4h4" />
          </svg>
        );
      case "calling-agents":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 3V1m-2 0h4" />
          </svg>
        );
      case "calling-settings":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        );
      case "settings":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white" : "bg-zinc-600"}`} />;
    }
  };

  const renderNavSection = (title: string, items: NavItem[], showBorderTop = false) => (
    <div className={`space-y-0.5 ${showBorderTop ? "pt-3 border-t border-white/[0.08]" : ""}`}>
      <p className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold select-none">
        {title}
      </p>
      {items.map((item) => {
        const active = isItemActive(item.href, item.isExact);
        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onClose}
            className={`group relative w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors duration-150 ${
              active
                ? "bg-[#7D39EB]/15 text-white font-medium border border-[#7D39EB]/35 shadow-xs relative"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent font-normal"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {/* 2px Violet left pill bar */}
            {active && (
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#7D39EB] rounded-r-full"
                aria-hidden="true"
              />
            )}

            <div className="flex items-center space-x-2.5 min-w-0">
              {renderNavIcon(item.id, active)}
              <span className="tracking-tight truncate">{item.label}</span>
            </div>

            {item.id === "calling-overview" && (
              <span
                className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border shrink-0 ${
                  active
                    ? "bg-[#7D39EB]/25 text-white border-[#7D39EB]/40"
                    : "bg-white/[0.06] text-zinc-400 border-white/[0.08]"
                }`}
              >
                AI
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in-0 duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface-panel border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out select-none shadow-2xl md:shadow-none relative ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Subtle top specular reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none z-30"
          aria-hidden="true"
        />

        {/* Top Brand & Workspace Switcher Header */}
        <div className="p-3 sm:p-3.5 border-b border-white/[0.08] space-y-2.5 bg-surface-panel relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2.5 group focus-visible:outline-none"
              onClick={onClose}
            >
              {/* Crisp VDS emblem in high contrast with subtle specular top hairline reflection */}
              <div className="relative w-7 h-7 rounded-lg bg-white text-black font-extrabold flex items-center justify-center text-[11px] tracking-tight shadow-xs group-hover:scale-105 transition-transform duration-150 overflow-hidden">
                <span className="relative z-10">VDS</span>
                <div
                  className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-20"
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-white text-sm tracking-tight">closeVDS</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#C6FF33]/15 text-[#C6FF33] border border-[#C6FF33]/30 font-medium uppercase tracking-wider">
                  OS
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Interactive Workspace Pill */}
          <Link
            href="/settings"
            onClick={onClose}
            className="group relative px-2.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-card-hover border border-white/[0.08] hover:border-white/[0.14] flex items-center justify-between text-xs transition-colors shadow-xs cursor-pointer overflow-hidden"
            title="Manage Workspace Settings"
          >
            {/* Hairline reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none"
              aria-hidden="true"
            />
            <div className="flex items-center space-x-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shrink-0 shadow-[0_0_6px_rgba(198,255,51,0.6)]" />
              <span className="font-medium text-zinc-200 group-hover:text-white truncate capitalize tracking-tight">
                {workspace?.name || "Production OS"}
              </span>
            </div>
            <div className="flex items-center space-x-1 shrink-0 text-zinc-500 group-hover:text-zinc-400">
              <span className="text-[10px] font-mono uppercase">v1.0</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Center */}
        <div className="flex-1 py-3 px-2.5 overflow-y-auto space-y-4 text-left no-scrollbar">
          {/* Section 1: PIPELINE */}
          {renderNavSection("Pipeline", PIPELINE_NAV_ITEMS, false)}

          {/* Section 2: AI CALLING */}
          {renderNavSection("AI Calling", CALLING_NAV_ITEMS, true)}

          {/* Section 3: SYSTEM */}
          {renderNavSection("System", SYSTEM_NAV_ITEMS, true)}

          {/* Safety Shield */}
          <div className="pt-2">
            <SafetyShield />
          </div>
        </div>

        {/* User Profile / Status Footer */}
        <div className="p-2.5 border-t border-white/[0.08] bg-surface-panel relative">
          <div
            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div className="p-2 rounded-lg bg-surface-card border border-white/[0.08] hover:border-white/[0.14] flex items-center justify-between transition-colors shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-xs font-semibold text-white shrink-0 font-mono">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium text-white truncate leading-tight capitalize tracking-tight">
                  {user?.name || "Workspace Shell"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 font-medium border border-white/[0.06]">
                    {user?.role || "OWNER"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-950/20 transition-colors shrink-0 cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
