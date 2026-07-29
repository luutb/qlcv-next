import type { AuthUser } from "@/api/auth.api";
import { AppBar, Avatar, Chip, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { ROLE_LABELS } from "../model/roles";

export function AppShellTopBar({ user, role, onOpenUserMenu }: { user: AuthUser | null; role: string; onOpenUserMenu: (anchor: HTMLElement) => void }) {
  return <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", color: "text.primary" }}><Toolbar sx={{ gap: 1.5 }}><Typography variant="h6" component="div" sx={{ fontWeight: 700, flexGrow: 1 }}>Lean Legal Engine</Typography>{role ? <Chip size="small" label={ROLE_LABELS[role] ?? role} /> : null}{user?.tenant_plan ? <Chip size="small" color="primary" label={user.tenant_plan} /> : null}<Tooltip title={user?.username ?? "Account"}><IconButton onClick={(event) => onOpenUserMenu(event.currentTarget)} size="small"><Avatar sx={{ width: 32, height: 32 }}>{(user?.username ?? "U").slice(0, 1).toUpperCase()}</Avatar></IconButton></Tooltip></Toolbar></AppBar>;
}
