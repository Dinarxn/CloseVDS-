import React from "react";

export type ToastVariant = "default" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const variantStyles: Record<ToastVariant, string> = {
    default: "bg-[#121216] border-white/[0.08] text-white",
    success: "bg-[#121216] border-emerald-500/30 text-white shadow-[0_4px_24px_rgba(16,185,129,0.08)]",
    warning: "bg-[#121216] border-amber-500/30 text-white shadow-[0_4px_24px_rgba(245,158,11,0.08)]",
    error: "bg-[#121216] border-rose-500/40 text-white shadow-[0_4px_24px_rgba(244,63,94,0.08)]",
  };

  const renderIcon = (variant: ToastVariant) => {
    switch (variant) {
      case "success":
        return (
          <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const badgeLabels: Record<ToastVariant, string | null> = {
    default: null,
    success: "Success",
    warning: "Warning",
    error: "Error",
  };

  const currentVariant = toast.variant || "default";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-80 sm:w-96 p-4 rounded-xl border shadow-2xl flex items-start justify-between space-x-3 transition-all duration-200 ease-in-out relative overflow-hidden ${
        variantStyles[currentVariant]
      }`}
    >
      {/* Top light edge reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="flex items-start space-x-3 min-w-0 flex-1">
        {renderIcon(currentVariant)}
        <div className="space-y-1 text-left flex-1 min-w-0">
          {badgeLabels[currentVariant] && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
              {badgeLabels[currentVariant]}
            </span>
          )}
          <h4 className="text-xs font-semibold text-white tracking-tight truncate">
            {toast.title}
          </h4>
          {toast.description && (
            <p className="text-[11px] text-zinc-400 leading-relaxed break-words">
              {toast.description}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-zinc-500 hover:text-white p-1 rounded-md transition-colors shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
