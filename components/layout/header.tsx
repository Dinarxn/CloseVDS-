"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTE_TITLE_MAP } from "@/components/navigation/navigation-items";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from "@/components/ui/dropdown-menu";
import {
  SettingsIcon,
  PlugIcon,
  BarChartIcon,
  UserIcon,
  PhoneIcon,
  LogoutIcon,
} from "@/components/ui/icons";
import { CommandPalette } from "./command-palette";

export interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspace, logout } = useAuth();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Resolve header title from prop or route title map
  const resolvedTitle =
    title || ROUTE_TITLE_MAP[pathname] || "closeVDS";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "WS";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <header className="relative h-14 bg-surface-panel/90 backdrop-blur-md border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        {/* Specular hairline top reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Left Cluster: Mobile Toggle & Dynamic Breadcrumbs Hierarchy */}
        <div className="flex items-center space-x-3 min-w-0">
          {/* Mobile Sidebar Menu Button */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#7D39EB] transition-colors cursor-pointer outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Dynamic Breadcrumbs Hierarchy */}
          <nav className="flex items-center space-x-1.5 text-xs font-medium min-w-0" aria-label="Breadcrumb">
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:inline-block shrink-0"
            >
              closeVDS
            </Link>
            <svg
              className="w-3 h-3 text-zinc-600 hidden sm:inline-block shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-semibold tracking-tight truncate">
              {resolvedTitle}
            </span>
          </nav>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Quick Search / Command Button */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-surface-card border border-white/[0.08] hover:border-white/[0.18] hover:bg-surface-card-hover text-xs text-zinc-300 hover:text-white transition-all duration-150 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#7D39EB] outline-none active:scale-[0.98]"
            title="Open Command Palette (⌘K)"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[11px] font-medium">Command</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated text-zinc-300 font-mono text-[9px] border border-white/[0.10]">
              ⌘K
            </kbd>
          </button>

          {/* Workspace Context Dropdown */}
          <DropdownMenu>
            <DropdownTrigger asChild>
              <button
                type="button"
                className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-surface-card border border-white/[0.08] hover:border-white/[0.18] hover:bg-surface-card-hover text-xs text-zinc-300 hover:text-white transition-all duration-150 cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#7D39EB] outline-none active:scale-[0.98]"
                title="Active Workspace"
                aria-label="Active Workspace"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_8px_rgba(198,255,51,0.5)] shrink-0" />
                <span className="font-medium text-[11px] truncate max-w-[130px] capitalize">
                  {workspace?.name || "Production OS"}
                </span>
                <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-56">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">
                  Active Workspace
                </div>
                <div className="text-xs font-bold text-white capitalize mt-0.5 flex items-center justify-between">
                  <span className="truncate">{workspace?.name || "Production OS"}</span>
                  <span className="text-[10px] text-[#C6FF33] font-normal flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_6px_rgba(198,255,51,0.6)]" />
                    Online
                  </span>
                </div>
              </div>
              <DropdownItem onClick={() => router.push("/settings")}>
                <SettingsIcon size={14} className="text-zinc-400 shrink-0" />
                <span>Workspace Settings</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/calling/settings")}>
                <PlugIcon size={14} className="text-zinc-400 shrink-0" />
                <span>n8n &amp; Telephony Gateway</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/analytics")}>
                <BarChartIcon size={14} className="text-zinc-400 shrink-0" />
                <span>Workspace Analytics</span>
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownTrigger asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-surface-elevated hover:bg-zinc-800 border border-white/[0.12] hover:border-white/[0.22] flex items-center justify-center text-xs font-bold text-white shadow-xs transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7D39EB] outline-none active:scale-[0.98]"
                title={user?.name || "User Profile"}
                aria-label="User Profile"
              >
                {initials}
              </button>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-56">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <div className="text-xs font-bold text-white truncate">{user?.name || "Operator"}</div>
                <div className="text-[11px] text-zinc-400 truncate">{user?.email || "admin@closevds.local"}</div>
              </div>
              <DropdownItem onClick={() => router.push("/settings")}>
                <UserIcon size={14} className="text-zinc-400 shrink-0" />
                <span>Account Settings</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/calling/settings")}>
                <PhoneIcon size={14} className="text-zinc-400 shrink-0" />
                <span>AI Calling Gateway</span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 focus:bg-rose-950/30 focus:text-rose-300"
              >
                <LogoutIcon size={14} className="text-rose-400 shrink-0" />
                <span>Sign Out</span>
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Command Palette Dialog */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </>
  );
}
