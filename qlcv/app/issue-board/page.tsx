import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/features/shared/redirect-url";

export default async function IssueBoardRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/work", await searchParams));
}
