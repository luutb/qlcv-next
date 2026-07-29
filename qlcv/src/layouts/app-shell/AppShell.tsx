"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettings,
  Assessment,
  Assignment,
  Category,
  Dashboard,
  Description,
  Home,
  Inventory2,
  Logout,
  People,
  Person,
  ReceiptLong,
  Settings,
  TaskAlt,
  ViewKanban,
  WorkHistory,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { logout } from "@/api/auth.api";
import { SessionExpiredError } from "@/api/client";
import { authStore } from "@/features/auth/auth.store";

const drawerWidth = 264;

type KnownRole = "SUPER_ADMIN" | "PARTNER" | "LAWYER" | "ACCOUNTANT";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  roles?: KnownRole[];
  always?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Dashboard fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Work Board",
    href: "/work",
    icon: <TaskAlt fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Workflow Board",
    href: "/projects/board",
    icon: <ViewKanban fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <Assignment fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Customers",
    href: "/customers",
    icon: <Category fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Documents",
    href: "/documents",
    icon: <Description fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Time Entries",
    href: "/time-entries",
    icon: <WorkHistory fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: <ReceiptLong fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  { label: "Labels", href: "/labels", icon: <TagIcon />, roles: ["SUPER_ADMIN", "PARTNER"] },
  {
    label: "Audit Logs",
    href: "/audit-logs",
    icon: <Assessment fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  { label: "OKR", href: "/okr", icon: <Home fontSize="small" />, roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] },
  {
    label: "Reports",
    href: "/reports",
    icon: <Assessment fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  },
  {
    label: "Workflow Templates",
    href: "/settings/workflow-templates",
    icon: <Settings fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER"],
  },
  {
    label: "User Management",
    href: "/users",
    icon: <People fontSize="small" />,
    roles: ["SUPER_ADMIN", "PARTNER"],
  },
  {
    label: "Profile",
    href: "/settings/profile",
    icon: <Person fontSize="small" />,
    always: true,
  },
  {
    label: "Tenant Settings",
    href: "/admin/tenant-settings",
    icon: <Settings fontSize="small" />,
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "Admin Purge",
    href: "/admin/purge",
    icon: <AdminPanelSettings fontSize="small" />,
    roles: ["SUPER_ADMIN"],
  },
];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  PARTNER: "Partner",
  LAWYER: "Lawyer",
  ACCOUNTANT: "Accountant",
};

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
        if (!isLoginRoute) {
          router.replace("/login");
        }
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
        if (!cancelled) {
          setUser(nextUser);
        }
      } catch (error) {
        authStore.clearToken();
        if (!cancelled && !(error instanceof SessionExpiredError)) {
          router.replace("/login");
        }
      } finally {
        if (!cancelled) {
          setUserLoaded(true);
        }
      }
    }

    void syncUser();

    return () => {
      cancelled = true;
    };
  }, [hasToken, isLoginRoute, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!userLoaded || !hasToken) {
    return <LinearProgress />;
  }

  const role = user?.role ?? "";
  const visibleNavItems = NAV_ITEMS.filter((item) => item.always || item.roles?.includes(role as KnownRole));
  const activePath = pathname;
  const canAccessRoute = canAccessPath(activePath, role);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          color: "text.primary",
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, flexGrow: 1 }}>
            Lean Legal Engine
          </Typography>
          {role ? <Chip size="small" label={ROLE_LABELS[role] ?? role} /> : null}
          {user?.tenant_plan ? <Chip size="small" color="primary" label={user.tenant_plan} /> : null}
          <Tooltip title={user?.username ?? "Account"}>
            <IconButton onClick={(event) => setUserMenuAnchor(event.currentTarget)} size="small">
              <Avatar sx={{ width: 32, height: 32 }}>{(user?.username ?? "U").slice(0, 1).toUpperCase()}</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", px: 1.5, py: 1 }}>
          <List disablePadding>
            {visibleNavItems.map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={activePath === item.href || activePath.startsWith(`${item.href}/`)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {user?.email ?? "No email"}
            </Typography>
            {user?.organization_id ? (
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                Org: {user.organization_id}
              </Typography>
            ) : null}
          </Stack>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          pt: 10,
        }}
      >
        {canAccessRoute ? children : <NoPermissionPage pathname={pathname} />}
      </Box>

      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null);
            router.push("/settings/profile");
          }}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setUserMenuAnchor(null);
            logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

function canAccessPath(pathname: string, role: string): boolean {
  if (pathname === "/login") {
    return true;
  }

  if (!role || !isKnownRole(role)) {
    return false;
  }

  if (role === "SUPER_ADMIN") {
    return true;
  }

  if (pathname.startsWith("/admin")) {
    return false;
  }

  if (pathname.startsWith("/users") || pathname.startsWith("/settings/users") || pathname.startsWith("/settings/workflow-templates")) {
    return role === "PARTNER";
  }

  if (pathname.startsWith("/labels")) {
    return role === "PARTNER";
  }

  if (pathname.startsWith("/settings/profile")) {
    return true;
  }

  return true;
}

function NoPermissionPage({ pathname }: { pathname: string }) {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Không có quyền truy cập
      </Typography>
      <Typography color="text.secondary">{pathname}</Typography>
    </Stack>
  );
}

function TagIcon() {
  return <Inventory2 fontSize="small" />;
}

function isKnownRole(role: string): role is KnownRole {
  return role === "SUPER_ADMIN" || role === "PARTNER" || role === "LAWYER" || role === "ACCOUNTANT";
}
