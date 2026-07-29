import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/shared/lib/routing";

export default async function LegacyWorkflowSettingsRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/settings/workflow-templates", await searchParams));
}
