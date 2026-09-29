"use client";

import React, { useEffect, useRef } from "react";
import { CloseIcon } from "./icons";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Store element that opened the dialog to restore focus on close
  useEffect(() => {
    if (open) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard Escape listener & Focus Trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Auto focus first element or container on open
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      } else {
        dialogRef.current.focus();
      }
    }
  }, [open]);

  if (!open) return null;

  const titleId = "dialog-title-" + Math.random().toString(36).substring(2, 9);
  const descId = "dialog-desc-" + Math.random().toString(36).substring(2, 9);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop: deep obsidian with medium blur */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-150 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog Shell */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full max-w-lg bg-[#0D0D12] border border-white/[0.10] rounded-xl sm:rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] space-y-4 z-10 text-left overflow-hidden transition-all duration-150 animate-in fade-in-0 zoom-in-95 ${className}`}
      >
        {/* Specular hairline top reflection */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 id={titleId} className="text-base font-semibold text-white tracking-tight">
              {title}
            </h3>
            {description && (
              <p id={descId} className="text-xs text-zinc-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer shrink-0"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="pt-1">{children}</div>
      </div>
    </div>
  );
}
