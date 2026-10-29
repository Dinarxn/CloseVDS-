"use client";

import React, { createContext, useContext, useState, useRef } from "react";

export type TabsVariant = "underline" | "pills";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be used within <Tabs>");
  }
  return context;
}

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
}

export function Tabs({
  value,
  defaultValue = "",
  onValueChange,
  children,
  className = "",
  variant = "underline",
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={`space-y-4 text-left ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  variant?: TabsVariant;
}

export function TabList({ children, className = "", variant: listVariant }: TabListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const context = useTabsContext();
  const effectiveVariant = listVariant || context.variant;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!listRef.current) return;
    const tabs = Array.from(
      listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])')
    );
    if (tabs.length === 0) return;

    const currentIndex = tabs.findIndex((tab) => tab === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    }
  };

  const defaultClasses =
    effectiveVariant === "pills"
      ? "inline-flex items-center p-1 rounded-xl bg-surface-canvas border border-white/[0.08] gap-1 overflow-x-auto max-w-full"
      : "flex items-center space-x-1 border-b border-white/[0.08] overflow-x-auto";

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={`${defaultClasses} ${className}`}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: "underline" | "pill" | "pills";
}

export function Tab({
  value,
  disabled = false,
  children,
  className = "",
  variant: tabVariant,
}: TabProps) {
  const { activeTab, setActiveTab, variant: contextVariant } = useTabsContext();
  const isActive = activeTab === value;
  const isPill = tabVariant === "pill" || tabVariant === "pills" || contextVariant === "pills";

  if (isPill) {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => !disabled && setActiveTab(value)}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:text-white ${
          isActive
            ? "bg-white/[0.08] text-white border border-white/[0.12] shadow-xs font-semibold"
            : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:text-white ${
        isActive
          ? "border-white text-white font-semibold"
          : "border-transparent text-zinc-400 hover:text-zinc-200"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className = "" }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" tabIndex={0} className={`focus:outline-none pt-2 ${className}`}>
      {children}
    </div>
  );
}

