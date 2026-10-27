"use client";

import { useState } from "react";

import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { WorkspaceTemplate } from "@/components/templates";
import { useDashboardSummaryQuery } from "../hooks/use-dashboard-summary";
import { DashboardLiveView } from "../ui/dashboard-live-view";
import { DataStatePage } from "@/components/organisms";
import { getSafeApiErrorMessage } from "@/services/http";

function DashboardContent() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const query = useDashboardSummaryQuery({ range });
  if (!query.data && !query.isLoading && !query.error) return <DataStatePage eyebrow="Dashboard" title="Cần đăng nhập" description="Đăng nhập để tải số liệu tổng quan từ API." endpoint="GET /api/v1/dashboard/summary" actionLabel="Đăng nhập" actionHref="/login" />;
  if (query.isLoading) return <DataStatePage eyebrow="Dashboard" title="Đang tải dữ liệu" description="Đang lấy aggregate dashboard từ máy chủ." endpoint="GET /api/v1/dashboard/summary" />;
  if (query.error) return <DataStatePage eyebrow="Dashboard" title="Không tải được dashboard" description={getSafeApiErrorMessage(query.error, "API dashboard chưa trả response đúng canonical contract.")} endpoint="GET /api/v1/dashboard/summary" actionLabel="Thử lại" actionHref="/" />;
  return <DashboardLiveView summary={query.data!} range={range} onRange={setRange} />;
}

export function DashboardScreen() {
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/" />} topbar={<WorkhubTopbar />}><main id="main-content" className="workhub-content"><DashboardContent /></main></WorkspaceTemplate>;
}
