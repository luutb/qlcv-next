import { Logout } from "@mui/icons-material";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";

export function AppShellUserMenu({ anchor, onClose, onProfile, onLogout }: { anchor: HTMLElement | null; onClose: () => void; onProfile: () => void; onLogout: () => void }) {
  return <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={onClose}><MenuItem onClick={onProfile}>Profile</MenuItem><MenuItem onClick={onLogout}><ListItemIcon><Logout fontSize="small" /></ListItemIcon>Logout</MenuItem></Menu>;
}
