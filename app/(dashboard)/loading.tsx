import React from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageSkeleton } from "@/components/shared/workspace-skeleton";

export default function DashboardLoading() {
  return (
    <PageContainer>
      <PageSkeleton hasToolbar={true} sectionsCount={2} />
    </PageContainer>
  );
}
