import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/shared/lib/routing";

export default async function LegacyUsersRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/users", await searchParams));
}
