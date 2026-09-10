"use client";

import React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <div className="pt-4 flex items-center justify-end space-x-3">
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
          variant={variant === "destructive" ? "secondary" : "primary"}
          size="sm"
          onClick={handleConfirm}
          disabled={isLoading || disabled}
          className={
            variant === "destructive"
              ? "border-red-500/80 text-red-400 hover:bg-red-950/40 hover:text-red-300"
              : ""
          }
        >
          {isLoading ? (
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </span>
          ) : (
            confirmLabel
          )}
        </Button>
      </div>
    </Dialog>
  );
}
