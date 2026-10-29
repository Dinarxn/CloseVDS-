import React from "react";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-surface-canvas text-zinc-400 py-14 sm:py-16 text-xs selection:bg-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand & Mission (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-xl bg-surface-card border border-white/[0.12] flex items-center justify-center text-white font-mono font-bold text-xs tracking-tight shadow-sm group-hover:border-white/[0.24] transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base tracking-tight">CloseVDS</span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-wide uppercase">Acquisition OS</span>
              </div>
            </Link>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              The unified operating system for B2B client acquisition. Deterministic account discovery, empirical opportunity auditing, governed cold outreach, and real-time deal acceleration.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-panel border border-white/[0.08] text-[11px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • Engine 2.4</span>
            </div>
          </div>

          {/* Workspaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Workspaces
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/leads" className="hover:text-white transition-colors">
                  Leads & Discovery
                </Link>
              </li>
              <li>
                <Link href="/crm" className="hover:text-white transition-colors">
                  CRM Deal Pipeline
                </Link>
              </li>
              <li>
                <Link href="/operations" className="hover:text-white transition-colors">
                  Operations & Tasks
                </Link>
              </li>
              <li>
                <Link href="/outreach" className="hover:text-white transition-colors">
                  Outreach Orchestrator
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors">
                  Acquisition Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Safeguards & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Safeguards & Trust
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  Human-in-the-Loop Gate
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  Deterministic Fact Grounding
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  CAN-SPAM Safe Throttle
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-white transition-colors">
                  Sovereign Data Isolation
                </a>
              </li>
              <li>
                <a href="#specs" className="hover:text-white transition-colors">
                  Technical Specifications
                </a>
              </li>
            </ul>
          </div>

          {/* Access & Auth */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Access & Auth
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In to Workspace
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Workspace
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="hover:text-white transition-colors">
                  Password Recovery
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Direct Workspace Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} CloseVDS Platform • Autonomous Client Acquisition Operating System.
          </div>
          <div className="flex items-center space-x-5">
            <span>Sovereign Architecture</span>
            <span>•</span>
            <span>Obsidian Precision Monochrome</span>
            <span>•</span>
            <span>Zero Hallucination Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
