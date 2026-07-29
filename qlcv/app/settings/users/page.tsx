import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/features/shared/redirect-url";

export default async function LegacyUsersRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/users", await searchParams));
}
