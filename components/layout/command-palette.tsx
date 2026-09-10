"use client";

import React, { useState, useEffect, useRef } from "react";
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
  shortcut?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // Navigation
  { id: "overview", label: "Acquisition Command Center", category: "Navigation", href: "/dashboard", icon: "dashboard" },
  { id: "leads", label: "Lead Pool & Prospects", category: "Navigation", href: "/leads", icon: "leads" },
  { id: "operations", label: "Operations Work Queue", category: "Navigation", href: "/operations", icon: "operations" },
  { id: "calling", label: "AI Calling Operations", category: "Voice & AI", href: "/calling", icon: "calling" },
  { id: "calling-calls", label: "Call Queue & Approvals", category: "Voice & AI", href: "/calling/calls", icon: "calls" },
  { id: "calling-agents", label: "Voice Agent Configurations", category: "Voice & AI", href: "/calling/agents", icon: "agents" },
  { id: "calling-settings", label: "n8n Gateway & Telephony Link", category: "Voice & AI", href: "/calling/settings", icon: "telephony" },
  { id: "crm", label: "CRM Pipeline & Deals", category: "Navigation", href: "/crm", icon: "crm" },
  { id: "analytics", label: "Acquisition Analytics & KPIs", category: "Navigation", href: "/analytics", icon: "analytics" },

  // Quick Actions
  { id: "new-agent", label: "Create New Voice Agent", category: "Quick Actions", href: "/calling/agents/new", icon: "plus" },
  { id: "import-leads", label: "Import Prospects to Lead Pool", category: "Quick Actions", href: "/leads", icon: "import" },

  // Settings
  { id: "settings-workspace", label: "Workspace & Safety Settings", category: "Settings", href: "/settings", icon: "settings" },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter commands
  const filtered = COMMAND_ITEMS.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Focus input on open
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

  const executeCommand = React.useCallback((item: CommandItem) => {
    onClose();
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  }, [onClose, router]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6 animate-in fade-in-0 duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-[#0f0f15] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden z-10 text-left">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-[#13131a]">
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
          />
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] border border-white/[0.08] shrink-0">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
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
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-100 ${
                    isSelected
                      ? "bg-white/[0.08] text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-4 h-4 text-zinc-400 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <span className="font-medium truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.04]">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-[#0c0c10] flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.08] text-[9px] font-mono text-zinc-400">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.08] text-[9px] font-mono text-zinc-400">↵</kbd> Select
            </span>
          </div>
          <span>closeVDS Quick Action</span>
        </div>
      </div>
    </div>
  );
}
