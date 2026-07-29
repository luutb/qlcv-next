import { redirect } from "next/navigation";
import { redirectUrl, type RouteSearchParams } from "@/shared/lib/routing";

export default async function WorkflowBoardRoute({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  redirect(redirectUrl("/projects/board", await searchParams));
}
