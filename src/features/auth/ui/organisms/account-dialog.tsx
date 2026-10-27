"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUserQuery } from "../../hooks/use-current-user";
import { USER_ROLE_LABELS } from "../../model/current-user";
import { logout } from "../../api/auth.api";
import Link from "next/link";
import { useState } from "react";

export function AccountDialog({ onClose }: { onClose: () => void }) {
  const user = useCurrentUserQuery();
  const router = useRouter();
  const client = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await client.cancelQueries();
    const revoked = await logout();
    client.clear();
    onClose();
    router.replace(revoked ? "/login" : "/login?reason=logout-failed");
  }
  return <Dialog open onClose={isLoggingOut ? undefined : onClose} fullWidth maxWidth="xs"><DialogTitle>Tài khoản</DialogTitle><DialogContent>{user.data ? <><h3>{user.data.username}</h3><p>{user.data.email}</p><p>{USER_ROLE_LABELS[user.data.role]}</p></> : <p>{user.error ? "Không tải được thông tin tài khoản." : "Đang tải thông tin tài khoản…"}</p>}</DialogContent><DialogActions>{user.data?.account_scope !== "platform" && <Button component={Link} href="/subscription" onClick={onClose} disabled={isLoggingOut}>Gói sử dụng</Button>}<Button onClick={onClose} disabled={isLoggingOut}>Đóng</Button><Button onClick={handleLogout} disabled={isLoggingOut}>{isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}</Button></DialogActions></Dialog>;
}
