"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DashboardQuery } from "@/api/dashboard.types";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { DashboardContent } from "./components/DashboardContent";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardLoading, StateCard } from "./components/DashboardPrimitives";
import { applyDashboardQuery, parseDashboardQuery } from "./model/dashboard.utils";
import { useDashboardSummary } from "./useDashboardSummary";

export function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseDashboardQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const summaryQuery = useDashboardSummary(query);

  function updateQuery(next: Partial<DashboardQuery>) {
    const params = applyDashboardQuery(new URLSearchParams(searchParams.toString()), query, next);
    router.replace(`/dashboard?${params.toString()}`);
  }

  return (
    <section className="od-dashboard" aria-labelledby="dashboardTitle">
      <DashboardHeader query={query} onQueryChange={updateQuery} onRefresh={() => summaryQuery.refetch()} />
      {summaryQuery.isLoading ? <DashboardLoading /> : null}
      {summaryQuery.isError ? (
        <StateCard
          title={getUserFacingErrorMessage(summaryQuery.error)}
          description={getDebugErrorInfo(summaryQuery.error) ?? "Không tải được dữ liệu dashboard. Vui lòng thử lại."}
          actionLabel="Tải lại"
          onAction={() => summaryQuery.refetch()}
        />
      ) : null}
      {!summaryQuery.isLoading && !summaryQuery.isError && summaryQuery.data ? (
        <DashboardContent summary={summaryQuery.data} range={query.range ?? "30d"} />
      ) : null}
    </section>
  );
}
