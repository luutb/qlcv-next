"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, LinearProgress } from "@mui/material";
import { logout, type AuthUser } from "@/api/auth.api";
import { SessionExpiredError } from "@/api/client";
import { authStore } from "@/features/auth";
import { ErrorState } from "@/shared/ui";
import { AppShellSidebar } from "./components/AppShellSidebar";
import { AppShellTopBar } from "./components/AppShellTopBar";
import { AppShellUserMenu } from "./components/AppShellUserMenu";
import { NoPermissionPage } from "./components/NoPermissionPage";
import { canAccessPath } from "./model/access";
import { getVisibleNavItems } from "./model/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === "/login";
  const [sessionStatus, setSessionStatus] = useState<"checking" | "authenticated" | "anonymous" | "error">("checking");
  const [sessionError, setSessionError] = useState<unknown>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = authStore.subscribe((nextUser) => {
      if (!cancelled) setUser(nextUser);
    });

    async function syncUser() {
      if (!authStore.isAuthenticated()) {
        if (!cancelled) setSessionStatus("anonymous");
        if (!isLoginRoute) router.replace("/login");
        return;
      }
      const cachedUser = authStore.getUser();
      if (cachedUser) {
        if (!cachedUser.is_active) {
          authStore.clearToken();
          if (!cancelled) setSessionStatus("anonymous");
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setUser(cachedUser);
          setSessionStatus("authenticated");
        }
      }

      try {
        const nextUser = await authStore.refreshUser();
        if (!cancelled) {
          setUser(nextUser);
          setSessionStatus("authenticated");
          setSessionError(null);
        }
      } catch (error) {
        const sessionInvalid = error instanceof SessionExpiredError || !authStore.isAuthenticated();
        if (!cancelled) {
          if (sessionInvalid) {
            setUser(null);
            setSessionStatus("anonymous");
            if (!(error instanceof SessionExpiredError)) router.replace("/login");
          } else if (!cachedUser) {
            setSessionError(error);
            setSessionStatus("error");
          }
        }
      }
    }
    void syncUser();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isLoginRoute, router]);

  if (isLoginRoute) return <>{children}</>;
  if (sessionStatus === "error") {
    return <ErrorState error={sessionError} onRetry={() => window.location.reload()} />;
  }
  if (sessionStatus !== "authenticated") return <LinearProgress />;

  const role = user?.role ?? "";
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppShellTopBar user={user} role={role} onOpenUserMenu={setUserMenuAnchor} />
      <AppShellSidebar items={getVisibleNavItems(role)} activePath={pathname} user={user} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: 3, pt: 10 }}>
        {canAccessPath(pathname, role) ? children : <NoPermissionPage pathname={pathname} />}
      </Box>
      <AppShellUserMenu
        anchor={userMenuAnchor}
        onClose={() => setUserMenuAnchor(null)}
        onProfile={() => { setUserMenuAnchor(null); router.push("/settings/profile"); }}
        onLogout={() => { setUserMenuAnchor(null); logout(); }}
      />
    </Box>
  );
}
