import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/features/shared/redirect-url";

export default async function LegacyWorkflowSettingsRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/settings/workflow-templates", await searchParams));
}
