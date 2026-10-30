"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown compound components must be used within <DropdownMenu>");
  }
  return context;
}

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownTrigger({ children, asChild }: DropdownTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void;
      [key: string]: unknown;
    }>;
    return React.cloneElement(child, {
      ref: triggerRef,
      "aria-expanded": open,
      "aria-haspopup": "menu",
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        setOpen(!open);
      },
    });
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={() => setOpen(!open)}
      className="inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D39EB] rounded-lg"
    >
      {children}
    </button>
  );
}

export interface DropdownContentProps {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownContent({
  children,
  align = "left",
  className = "",
}: DropdownContentProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();
  const menuRef = useRef<HTMLDivElement>(null);

  // Outside click & Escape listener
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      className={`absolute ${
        align === "right" ? "right-0" : "left-0"
      } mt-2 min-w-[200px] bg-surface-card border border-white/[0.10] rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.8)] p-1.5 space-y-0.5 z-50 text-left backdrop-blur-xl relative overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 ${className}`}
    >
      {/* Specular hairline top reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export interface DropdownItemProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function DropdownItem({
  onClick,
  disabled = false,
  children,
  className = "",
}: DropdownItemProps) {
  const { setOpen } = useDropdownContext();

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    setOpen(false);
  };

  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-all duration-150 ${
        disabled
          ? "text-zinc-600 cursor-not-allowed"
          : "text-zinc-300 hover:text-white hover:bg-[#7D39EB]/15 focus:bg-[#7D39EB]/15 focus:text-white cursor-pointer"
      } focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="h-px w-full bg-white/[0.08] my-1" />;
}
