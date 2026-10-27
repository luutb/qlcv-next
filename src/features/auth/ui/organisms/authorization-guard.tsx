"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Alert, Button } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../../api/auth.api";
import { useEffect, type ReactNode } from "react";
import { useCurrentUserQuery } from "../../hooks/use-current-user";
import { canAccessRoute } from "../../model/route-access";
import { hasActiveSubscription, isPlatformAdministrator } from "../../model/current-user";

/** UI boundary only. APIs must enforce the same permissions on the server. */
export function AuthorizationGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const client = useQueryClient();
  const signOut = async () => { const revoked = await logout(); await client.cancelQueries(); client.clear(); router.replace(revoked ? "/login" : "/login?reason=logout-failed"); };
  const pathname = usePathname();
  const user = useCurrentUserQuery();
  const platformLanding = pathname === "/" && isPlatformAdministrator(user.data);
  const blockedByPlan = Boolean(user.data && user.data.account_scope !== "platform" && !hasActiveSubscription(user.data) && pathname !== "/subscription");
  useEffect(() => {
    if (blockedByPlan) router.replace("/subscription");
  }, [blockedByPlan, router]);
  useEffect(() => {
    if (platformLanding) router.replace("/platform");
  }, [platformLanding, router]);
  if (blockedByPlan) return <main id="main-content" role="status">Đang mở thông tin gói sử dụng…</main>;
  if (platformLanding) return <main id="main-content" role="status">Đang mở khu quản trị hệ thống…</main>;
  if (user.isPending) return <main className="state-page" role="status">Đang kiểm tra quyền truy cập…</main>;
  if (user.error) return <main className="state-page"><h1>Không xác minh được quyền truy cập</h1><Alert severity="error">Vui lòng thử tải lại thông tin tài khoản.</Alert><Button onClick={() => user.refetch()}>Thử lại</Button><Button onClick={signOut}>Đăng xuất</Button></main>;
  if (!canAccessRoute(user.data, pathname)) return <main className="state-page"><h1>Bạn chưa được cấp quyền truy cập</h1><p>Liên hệ quản trị viên nếu bạn cần sử dụng chức năng này.</p><Link className="quiet-button" href="/">Về tổng quan</Link><Button onClick={() => user.refetch()}>Kiểm tra lại quyền</Button><Button onClick={signOut}>Đăng xuất</Button></main>;
  return children;
}
