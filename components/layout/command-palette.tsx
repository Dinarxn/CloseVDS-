"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: "Navigation" | "Voice & AI" | "Quick Actions" | "Settings";
  href?: string;
  action?: () => void;
  icon: string;
  keywords?: string[];
  shortcut?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Category: Navigation
  {
    id: "overview",
    label: "Overview",
    category: "Navigation",
    href: "/dashboard",
    icon: "dashboard",
    keywords: ["overview", "dashboard", "acquisition", "command center", "home"],
  },
  {
    id: "leads",
    label: "Leads & Prospects",
    category: "Navigation",
    href: "/leads",
    icon: "leads",
    keywords: ["leads", "prospects", "lead pool", "contacts", "discovery"],
  },
  {
    id: "operations",
    label: "Operations",
    category: "Navigation",
    href: "/operations",
    icon: "operations",
    keywords: ["operations", "work queue", "tasks", "follow-ups"],
  },
  {
    id: "crm",
    label: "CRM",
    category: "Navigation",
    href: "/crm",
    icon: "crm",
    keywords: ["crm", "pipeline", "deals", "sales", "stages"],
  },
  {
    id: "analytics",
    label: "Analytics",
    category: "Navigation",
    href: "/analytics",
    icon: "analytics",
    keywords: ["analytics", "acquisition", "kpis", "metrics", "reports"],
  },

  // Category: Voice & AI
  {
    id: "calling",
    label: "AI Calling",
    category: "Voice & AI",
    href: "/calling",
    icon: "calling",
    keywords: ["ai calling", "voice", "calling operations", "studio"],
  },
  {
    id: "calling-calls",
    label: "Call Queue & History",
    category: "Voice & AI",
    href: "/calling/calls",
    icon: "calls",
    keywords: ["call queue", "history", "approvals", "dispatch", "logs"],
  },
  {
    id: "calling-agents",
    label: "Voice Agents",
    category: "Voice & AI",
    href: "/calling/agents",
    icon: "agents",
    keywords: ["voice agents", "configurations", "prompts", "bots"],
  },
  {
    id: "calling-settings",
    label: "Telephony & Gateway",
    category: "Voice & AI",
    href: "/calling/settings",
    icon: "telephony",
    keywords: ["telephony", "gateway", "n8n", "link", "sip", "providers"],
  },

  // Category: Quick Actions
  {
    id: "new-agent",
    label: "Create Voice Agent",
    category: "Quick Actions",
    href: "/calling/agents/new",
    icon: "plus",
    keywords: ["create voice agent", "new voice agent", "build", "add agent"],
  },
  {
    id: "import-leads",
    label: "Import Prospects",
    category: "Quick Actions",
    href: "/leads",
    icon: "import",
    keywords: ["import prospects", "import leads", "upload", "csv", "pool"],
  },

  // Category: Settings
  {
    id: "settings-workspace",
    label: "Workspace & Safety Settings",
    category: "Settings",
    href: "/settings",
    icon: "settings",
    keywords: ["settings", "workspace", "safety", "account", "profile", "governance"],
  },
];

function renderCommandIcon(icon: string) {
  switch (icon) {
    case "dashboard":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
        </svg>
      );
    case "leads":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "operations":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case "crm":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "analytics":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "calling":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case "calls":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
      );
    case "agents":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case "telephony":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "plus":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      );
    case "import":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      );
    case "settings":
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const router = useRouter();

  // Filter commands
  const filtered = COMMAND_ITEMS.filter((item) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  });

  // Focus input and lock scroll on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const executeCommand = useCallback(
    (item: CommandItem) => {
      onClose();
      if (item.href) {
        router.push(item.href);
      } else if (item.action) {
        item.action();
      }
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((curr) => (curr + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((curr) => (curr - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          executeCommand(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, executeCommand]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4 sm:p-6 animate-in fade-in-0 duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      {/* Shell */}
      <div
        className="relative w-full max-w-xl bg-surface-panel border border-white/[0.12] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden z-10 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top specular hairline reflection */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.14] to-transparent pointer-events-none" />

        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-surface-card">
          <svg className="w-5 h-5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, section, or action..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
            aria-autocomplete="list"
          />
          <kbd
            onClick={onClose}
            className="px-2 py-0.5 rounded bg-surface-elevated text-zinc-400 font-mono text-[10px] border border-white/[0.08] shrink-0 cursor-pointer hover:text-zinc-200"
          >
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-84 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-100 ${
                    isSelected
                      ? "bg-[#7D39EB]/15 text-white font-medium border border-[#7D39EB]/35 shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-4 h-4 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? "text-[#C6FF33]" : "text-zinc-400"
                      }`}
                    >
                      {renderCommandIcon(item.icon)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] shrink-0">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Telemetry & Hints */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-surface-panel flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-white/[0.08] text-[9px] font-mono text-zinc-300">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-white/[0.08] text-[9px] font-mono text-zinc-300">↵</kbd> Select
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-elevated border border-white/[0.08] text-[9px] font-mono text-zinc-300">ESC</kbd> Dismiss
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF33] shadow-[0_0_8px_#C6FF33]" />
            <span>closeVDS Quick Action</span>
          </div>
        </div>
      </div>
    </div>
  );
}
