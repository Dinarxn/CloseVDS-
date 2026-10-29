"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFooter } from "@/components/auth/auth-footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid work email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate sending instructions securely without leaking user existence
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password"
        description="Enter your work email address and we will dispatch recovery instructions for your workspace."
      />

      {isSubmitted ? (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <Alert variant="default" title="Reset Instructions Dispatched">
            If an active account exists for <strong className="text-white font-medium">{email}</strong>, password reset instructions have been queued.
          </Alert>

          <div className="p-3.5 rounded-xl bg-surface-panel border border-white/[0.08] text-xs text-zinc-400 leading-relaxed">
            Please check your inbox or security quarantine folder. For self-hosted enterprise deployments with private relay routing, contact your workspace administrator directly.
          </div>

          <Link href="/login" className="block pt-2">
            <Button variant="secondary" size="md" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Work Email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full font-semibold shadow-sm mt-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <AuthFooter>
        <p className="text-xs text-zinc-400">
          Remember your password?{" "}
          <Link href="/login" className="text-white hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </AuthFooter>
    </AuthCard>
  );
}
