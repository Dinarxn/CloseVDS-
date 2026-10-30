"use client";

import React, { useState, useId } from "react";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const sidePositions: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };

  return (
    <span className="relative inline-flex items-center">
      {React.cloneElement(children, {
        "aria-describedby": tooltipId,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          setIsVisible(true);
          children.props?.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          setIsVisible(false);
          children.props?.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent<HTMLElement>) => {
          setIsVisible(true);
          children.props?.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
          setIsVisible(false);
          children.props?.onBlur?.(e);
        },
      })}
      {isVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute ${sidePositions[side] || sidePositions.top} z-50 pointer-events-none whitespace-nowrap rounded-md bg-[#1D1D28] px-2.5 py-1 text-[11px] font-medium text-white shadow-xl border border-white/[0.12] transition-opacity duration-150 ${className}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
