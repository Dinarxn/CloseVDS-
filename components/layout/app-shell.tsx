"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AcquisitionWorkflowNav } from "@/components/shared/acquisition-workflow-nav";
import { useAuth } from "@/hooks/use-auth";

export interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export function AppShell({ children, pageTitle }: AppShellProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-surface-canvas text-white items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 font-bold flex items-center justify-center text-xs tracking-tighter mx-auto shadow-sm animate-pulse">
            VDS
          </div>
          <p className="text-xs text-zinc-400 tracking-wide">Restoring secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-surface-canvas text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Structural Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Header */}
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={pageTitle}
        />

        {/* Unified Acquisition Funnel Workflow Stepper */}
        <AcquisitionWorkflowNav />

        {/* Generic Scrollable Main Content Surface */}
        <main className="flex-1 overflow-y-auto bg-surface-canvas text-left">
          {children}
        </main>
      </div>
    </div>
  );
}
