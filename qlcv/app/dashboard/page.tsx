import { Suspense } from "react";
import { DashboardPage } from "@/features/dashboard";

export default function DashboardRoute() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  );
}
