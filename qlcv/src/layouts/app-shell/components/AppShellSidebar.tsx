import type { AuthUser } from "@/api/auth.api";
import Link from "next/link";
import { Box, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography } from "@mui/material";
import type { NavItem } from "../model/navigation";

const drawerWidth = 264;

export function AppShellSidebar({ items, activePath, user }: { items: NavItem[]; activePath: string; user: AuthUser | null }) {
  return <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box", borderRight: "1px solid", borderColor: "divider", bgcolor: "background.paper" } }}><Toolbar /><Box sx={{ overflow: "auto", px: 1.5, py: 1 }}><List disablePadding>{items.map((item) => <ListItemButton key={item.href} component={Link} href={item.href} selected={activePath === item.href || activePath.startsWith(`${item.href}/`)} sx={{ borderRadius: 2, mb: 0.5 }}><ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}</List><Divider sx={{ my: 2 }} /><Stack spacing={1}><Typography variant="caption" color="text.secondary">{user?.email ?? "No email"}</Typography>{user?.organization_id ? <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>Org: {user.organization_id}</Typography> : null}</Stack></Box></Drawer>;
}
