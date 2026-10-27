"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountDialog, canAccessRoute, hasAuthorizedAction, USER_ROLE_LABELS } from "@/features/auth";
import { TaskSearch } from "@/features/tasks";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user";
import { WorkhubAvatar, WorkhubIcon } from "@/components/atoms";

export function WorkhubTopbar({ variant = "dashboard" }: { variant?: "dashboard" | "project" }) {
  const isProject = variant === "project";
  const user = useCurrentUserQuery();
  const canSearch = hasAuthorizedAction(user.data, "tasks.access");
  const quickLinks = [
    ...(hasAuthorizedAction(user.data, "tasks.create") ? [["/work", "Tạo công việc"]] : []),
    ...(hasAuthorizedAction(user.data, "projects.create") ? [["/projects/new", "Tạo dự án"]] : []),
    ...(hasAuthorizedAction(user.data, "users.manage") ? [["/users", "Nhân viên"]] : []),
    ...(hasAuthorizedAction(user.data, "customers.manage") ? [["/customers", "Khách hàng"]] : []),
  ].filter(([href]) => canAccessRoute(user.data, href));
  const [accountOpen, setAccountOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => { const handle = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key === "k" && canSearch) { event.preventDefault(); setSearchOpen(true); } if (event.key === "Escape") { setCreateOpen(false); setNotificationsOpen(false); } }; window.addEventListener("keydown", handle); return () => window.removeEventListener("keydown", handle); }, [canSearch]);
  return <header className={isProject ? "project-topbar" : "workhub-topbar"}>
    {isProject ? <Link href="/" className="project-mobile-brand"><span className="workhub-logo-mark"><WorkhubIcon name="grid" size={15} /></span>WorkHub</Link> : null}
    {canSearch && <button className={`search-trigger ${isProject ? "project-search" : ""}`} type="button" onClick={() => setSearchOpen(true)}><WorkhubIcon name="search" size={18} />Tìm kiếm công việc…<kbd>⌘K</kbd></button>}
    <div className={isProject ? "project-user" : "workhub-top-actions"}>{quickLinks.length > 0 && <div className="quick-create-wrap"><button className="quick-create" type="button" onClick={() => setCreateOpen((open) => !open)}><WorkhubIcon name="plus" size={18} /> Tạo nhanh <WorkhubIcon name="chevron" size={14} /></button>{createOpen ? <div className="top-popover create-popover">{quickLinks.map(([href, label]) => <Link key={href} href={href} onClick={() => setCreateOpen(false)}>{label}</Link>)}</div> : null}</div>}<div className="notification-wrap"><button className="top-icon" type="button" aria-label="Thông báo" onClick={() => setNotificationsOpen((open) => !open)}><WorkhubIcon name="bell" size={21} /></button>{notificationsOpen ? <div className="top-popover notification-popover"><strong>Thông báo</strong><p>Chưa có dữ liệu thông báo.</p>{hasAuthorizedAction(user.data, "audit.read") && <Link href="/audit">Xem hoạt động</Link>}</div> : null}</div><WorkhubAvatar initials={user.data?.username.slice(0, 2).toUpperCase() ?? "?"} tone="blue" /><span className="top-user"><strong>{user.data?.username ?? "Tài khoản"}</strong><small>{user.data ? USER_ROLE_LABELS[user.data.role] : ""}</small></span><button className="top-chevron" onClick={() => setAccountOpen(true)} aria-label="Mở tài khoản"><WorkhubIcon name="chevron" size={17} /></button></div>
    {searchOpen && canSearch ? <TaskSearch onClose={() => setSearchOpen(false)} /> : null}
  {accountOpen && <AccountDialog onClose={() => setAccountOpen(false)} />}</header>;
}
