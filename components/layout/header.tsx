"use client";

import React, { useState, useEffect } from "react";
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

  // Breadcrumbs parsing
  const segments = (pathname || "/dashboard")
    .split("/")
    .filter(Boolean);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <header className="h-13 bg-[#0d0d12]/90 backdrop-blur-md border-b border-white/[0.08] px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Mobile Sidebar Menu Button */}
          <button
            onClick={onMenuToggle}
            className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Dynamic Breadcrumbs Hierarchy */}
          <nav className="flex items-center space-x-1.5 text-xs font-medium min-w-0" aria-label="Breadcrumb">
            <span className="text-zinc-500 hidden sm:inline-block">closeVDS</span>
            {segments.length > 0 && (
              <>
                <svg className="w-3 h-3 text-zinc-600 hidden sm:inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white font-semibold tracking-tight truncate">
                  {resolvedTitle}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* Clickable Quick Search Command Palette Trigger */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#14141a] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1a1a24] text-xs text-zinc-400 hover:text-white transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
            title="Open Command Palette (⌘K)"
          >
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-[11px] text-zinc-300 font-medium">Command</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[9px] border border-white/[0.1]">
              ⌘K
            </kbd>
          </button>

          {/* Interactive Workspace Dropdown */}
          <DropdownMenu>
            <DropdownTrigger>
              <div className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#14141a] border border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1a1a24] text-xs text-zinc-300 transition-all duration-150 cursor-pointer active:scale-95">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-medium text-[11px] truncate max-w-[130px] capitalize">
                  {workspace?.name || "Production OS"}
                </span>
                <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-56">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-semibold">Active Workspace</div>
                <div className="text-xs font-bold text-white capitalize mt-0.5 flex items-center justify-between">
                  <span>{workspace?.name || "Production OS"}</span>
                  <span className="text-[10px] text-emerald-400 font-normal">● Online</span>
                </div>
              </div>
              <DropdownItem onClick={() => router.push("/settings")}>
                <span>⚙️</span>
                <span>Workspace Settings</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/calling/settings")}>
                <span>🔌</span>
                <span>n8n &amp; Telephony Gateway</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/analytics")}>
                <span>📊</span>
                <span>Workspace Analytics</span>
              </DropdownItem>
            </DropdownContent>
          </DropdownMenu>

          {/* Interactive User Profile Dropdown */}
          <DropdownMenu>
            <DropdownTrigger>
              <div
                className="w-7.5 h-7.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/[0.12] hover:border-white/[0.3] flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all duration-150 cursor-pointer active:scale-95"
                title={user?.name || "User Profile"}
              >
                {initials}
              </div>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-56">
              <div className="px-3 py-2 border-b border-white/[0.06]">
                <div className="text-xs font-bold text-white truncate">{user?.name || "Operator"}</div>
                <div className="text-[11px] text-zinc-400 truncate">{user?.email || "admin@closevds.local"}</div>
              </div>
              <DropdownItem onClick={() => router.push("/settings")}>
                <span>👤</span>
                <span>Account Settings</span>
              </DropdownItem>
              <DropdownItem onClick={() => router.push("/calling/settings")}>
                <span>🎙️</span>
                <span>AI Calling Gateway</span>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
              >
                <span>🚪</span>
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

