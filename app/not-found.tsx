import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-6 bg-[#09090b] text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />
      <EmptyState
        title="404 — Page Not Found"
        description="The requested workspace page, asset, or route does not exist or has moved."
        action={
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Return to Overview &rarr;
            </Button>
          </Link>
        }
      />
    </div>
  );
}
