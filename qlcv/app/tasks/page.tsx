import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/shared/lib/routing";

export default async function TasksRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/work", await searchParams));
}
