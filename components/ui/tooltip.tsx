import React from "react";

export interface TooltipProps {
  content: string;
  children: React.ReactElement<{ title?: string }>;
}

export function Tooltip({ content, children }: TooltipProps) {
  // Ultra-lightweight native title fallback wrapper per Phase 1 Step 2 requirements
  return React.cloneElement(children, {
    title: content,
  });
}
