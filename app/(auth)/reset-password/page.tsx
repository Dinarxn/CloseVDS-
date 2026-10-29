"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFooter } from "@/components/auth/auth-footer";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }, 600);
  };

  return (
    <AuthCard>
      <AuthHeader
        title="Set new password"
        description="Enter your new password below to update your CloseVDS security credentials."
      />

      {isSuccess ? (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <Alert variant="default" title="Password Updated Successfully">
            Your workspace password has been updated. Redirecting you to sign in...
          </Alert>

          <Link href="/login" className="block pt-2">
            <Button variant="primary" size="md" className="w-full font-semibold">
              Proceed to Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="leading-relaxed font-medium">{validationError}</span>
            </div>
          )}

          <PasswordField
            id="password"
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Must be at least 8 characters long."
            autoComplete="new-password"
            disabled={isSubmitting}
            required
          />

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
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
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      )}

      <AuthFooter>
        <p className="text-xs text-zinc-400">
          <Link href="/login" className="text-white hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </AuthFooter>
    </AuthCard>
  );
}
