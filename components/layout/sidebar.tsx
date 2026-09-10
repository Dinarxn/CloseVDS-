"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS, CALLING_NAV_ITEMS } from "@/components/navigation/navigation-items";
import { useAuth } from "@/hooks/use-auth";

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspace, logout } = useAuth();

  const isItemActive = (href: string, isExact?: boolean) => {
    if (!pathname) return false;
    if (isExact || href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isCallingActive = pathname?.startsWith("/calling");

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

  // Visual icons for navigation items
  const renderNavIcon = (id: string, active: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 transition-all duration-150 ${
      active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
    }`;

    switch (id) {
      case "dashboard":
      case "overview":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
          </svg>
        );
      case "leads":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case "operations":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "crm":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "calling":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        );
      case "analytics":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "settings":
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white" : "bg-zinc-600"}`} />;
    }
  };

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
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0f] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out select-none shadow-2xl md:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Brand & Workspace Switcher Header */}
        <div className="p-3.5 border-b border-white/[0.06] space-y-3 bg-[#0d0d14]/60">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2.5 group focus-visible:outline-none"
              onClick={onClose}
            >
              {/* Premium Brand Logo */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white via-zinc-200 to-zinc-400 text-zinc-950 font-extrabold flex items-center justify-center text-xs tracking-tighter shadow-[0_2px_10px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-all duration-200">
                VDS
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-sm tracking-tight">closeVDS</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
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
            className="group px-3 py-2 rounded-xl bg-[#12121a] hover:bg-[#161622] border border-white/[0.08] hover:border-white/[0.18] flex items-center justify-between text-xs transition-all duration-150 shadow-xs cursor-pointer"
            title="Manage Workspace Settings"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
              <span className="font-semibold text-zinc-200 group-hover:text-white truncate capitalize tracking-tight">
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
        <div className="flex-1 py-3 px-3 overflow-y-auto space-y-5 text-left no-scrollbar">
          {/* Main Pipeline Section */}
          <div className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono flex items-center justify-between">
              <span>Pipeline</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            </p>
            {MAIN_NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href, item.isExact);
              const showCallingChildren = item.id === "calling" && isCallingActive;
              return (
                <div key={item.id} className="space-y-1">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`group relative w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 ${
                      active
                        ? "bg-gradient-to-r from-white/[0.14] via-white/[0.08] to-white/[0.02] text-white font-semibold border border-white/[0.16] shadow-[0_2px_12px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] border border-transparent"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Active Left Accent Glow */}
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    )}

                    <div className="flex items-center space-x-2.5 min-w-0">
                      {renderNavIcon(item.id, active)}
                      <span className="tracking-tight truncate">{item.label}</span>
                    </div>

                    {item.id === "calling" && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 shadow-xs">
                        AI
                      </span>
                    )}
                  </Link>

                  {/* Calling Sub-tree Menu */}
                  {showCallingChildren && (
                    <div className="ml-5 pl-3 border-l border-white/[0.1] space-y-1 pt-1 pb-1">
                      {CALLING_NAV_ITEMS.map((sub) => {
                        const subActive = isItemActive(sub.href, sub.isExact);
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={onClose}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] rounded-lg transition-all duration-150 ${
                              subActive
                                ? "text-white font-semibold bg-[#1a1a26] border border-white/[0.1] shadow-xs"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                            }`}
                            aria-current={subActive ? "page" : undefined}
                          >
                            <span className="truncate">{sub.label}</span>
                            {subActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* System Section */}
          <div className="space-y-1 pt-3 border-t border-white/[0.06]">
            <p className="px-2.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">
              System
            </p>
            {FOOTER_NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href, item.isExact);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all duration-150 ${
                    active
                      ? "bg-gradient-to-r from-white/[0.14] via-white/[0.08] to-white/[0.02] text-white font-semibold border border-white/[0.16] shadow-[0_2px_12px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05] border border-transparent"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )}
                  {renderNavIcon(item.id, active)}
                  <span className="tracking-tight truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* AI OS Security & Compliance Widget */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#12121a] to-[#0d0d14] border border-white/[0.06] space-y-2 text-left">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-zinc-400 uppercase font-semibold">Safety Shield</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                18 GATES
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Anti-hallucination grounded context enforced.
            </p>
            <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-full" />
            </div>
          </div>
        </div>

        {/* User Profile / Status Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-[#0c0c12]/80">
          <div className="p-2.5 rounded-xl bg-[#121218] border border-white/[0.08] hover:border-white/[0.16] flex items-center justify-between transition-colors shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 border border-white/[0.14] flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-inner">
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate leading-tight capitalize">
                  {user?.name || "Workspace Shell"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/[0.08] text-zinc-400 font-bold border border-white/[0.04]">
                    {user?.role || "OWNER"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

