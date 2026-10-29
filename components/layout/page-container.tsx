import React from "react";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
}

export function PageContainer({
  maxWidth = "xl",
  className = "",
  children,
  ...props
}: PageContainerProps) {
  const maxWidthStyles = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-5xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`w-full mx-auto p-4 md:p-6 space-y-5 text-left ${maxWidthStyles[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
