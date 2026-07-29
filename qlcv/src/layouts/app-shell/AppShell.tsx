"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, LinearProgress } from "@mui/material";
import { logout } from "@/api/auth.api";
import { SessionExpiredError } from "@/api/client";
import { authStore } from "@/features/auth";
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
  const [userLoaded, setUserLoaded] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
  const [user, setUser] = useState(authStore.getUser());
  const hasToken = authStore.isAuthenticated();

  useEffect(() => {
    let cancelled = false;
    async function syncUser() {
      if (!hasToken) {
        setUserLoaded(true);
        if (!isLoginRoute) router.replace("/login");
        return;
      }
      const cachedUser = authStore.getUser();
      if (cachedUser) {
        setUser(cachedUser);
        setUserLoaded(true);
        return;
      }
      try {
        const nextUser = await authStore.refreshUser();
        authStore.setUser(nextUser);
        if (!cancelled) setUser(nextUser);
      } catch (error) {
        authStore.clearToken();
        if (!cancelled && !(error instanceof SessionExpiredError)) router.replace("/login");
      } finally {
        if (!cancelled) setUserLoaded(true);
      }
    }
    void syncUser();
    return () => { cancelled = true; };
  }, [hasToken, isLoginRoute, router]);

  if (isLoginRoute) return <>{children}</>;
  if (!userLoaded || !hasToken) return <LinearProgress />;

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
