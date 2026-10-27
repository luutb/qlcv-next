"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAccessToken } from "../../hooks/use-access-token";
import { clearSession, getStoredAccessToken, getTokenExpiresAt } from "../../model/session";

import { AuthorizationGuard } from "./authorization-guard";

const subscribe = () => () => undefined;

export function SessionGuard({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const token = useAccessToken();
  const pathname = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const publicPage = pathname === "/login";

  useEffect(() => {
    if (!hydrated || publicPage) return;
    const redirect = (expired = false) => {
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      clearSession();
      client.clear();
      const params = new URLSearchParams({ next: returnTo });
      if (expired) params.set("reason", "expired");
      router.replace(`/login?${params}`);
    };
    const check = () => {
      const current = getStoredAccessToken();
      const expiresAt = current ? getTokenExpiresAt(current) : null;
      if (!current || (expiresAt !== null && expiresAt <= Date.now())) redirect(Boolean(current));
    };
    const unauthorized = () => redirect(true);
    check();
    const expiresAt = token ? getTokenExpiresAt(token) : null;
    const timer = expiresAt === null ? undefined : window.setTimeout(check, Math.min(Math.max(0, expiresAt - Date.now()), 2_147_483_647));
    window.addEventListener("qlcv:unauthorized", unauthorized);
    window.addEventListener("focus", check);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("qlcv:unauthorized", unauthorized);
      window.removeEventListener("focus", check);
    };
  }, [hydrated, publicPage, token, pathname, router, client]);

  if (publicPage) return children;
  if (!hydrated || !token) {
    return <main id="main-content" className="session-loading" role="status">Đang kiểm tra phiên đăng nhập…</main>;
  }
  return <AuthorizationGuard>{children}</AuthorizationGuard>;
}
