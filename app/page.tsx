import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 text-center bg-[#09090b] text-white relative overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      <div className="space-y-6 max-w-md relative z-10">
        {/* Brand Emblem */}
        <div className="w-12 h-12 rounded-2xl bg-[#121216] border border-white/[0.12] flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent" />
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            closeVDS
          </h1>
          <p className="text-zinc-300 font-medium text-base">
            AI Client Acquisition Operating System
          </p>
          <p className="text-[11px] text-zinc-500 tracking-widest uppercase font-mono font-semibold">
            Find &bull; Qualify &bull; Reach &bull; Close
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
              <span>Enter Workspace</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
