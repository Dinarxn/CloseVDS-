"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WarningIcon } from "@/components/ui/icons";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  disabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    if (isLoading || disabled) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (isLoading || disabled) return;
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isLoading && !disabled) {
          onOpenChange(newOpen);
        }
      }}
      title={title}
      description={description}
    >
      <div className="pt-2 space-y-4">
        {variant === "destructive" && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 text-xs">
            <WarningIcon size={16} className="text-rose-400 mt-0.5 shrink-0" />
            <span className="leading-relaxed">
              This action may affect active queues or operations. Please verify before proceeding.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading || disabled}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "primary"}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
